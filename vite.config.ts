/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      {
        name: 'gemini-ai-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.method !== 'POST' || req.url !== '/api/ai-suggestions') {
              return next()
            }

            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body || '{}')
                const primaryApiKey = env.VITE_OPENAI_API_KEY || ''
                const geminiApiKey =
                  env.VITE_GEMINI_API_KEY || (primaryApiKey.startsWith('AIza') ? primaryApiKey : '')
                const openaiApiKey =
                  env.VITE_OPENAI_FALLBACK_API_KEY ||
                  env.VITE_GPT_API_KEY ||
                  (!primaryApiKey.startsWith('AIza') ? primaryApiKey : '')

                if (!geminiApiKey && !openaiApiKey) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(
                    JSON.stringify({
                      error:
                        'Missing API keys. Set VITE_GEMINI_API_KEY and/or VITE_OPENAI_API_KEY (or VITE_OPENAI_FALLBACK_API_KEY).',
                    })
                  )
                  return
                }

                const prompt = payload.prompt || ''
                const model = payload.model || env.VITE_OPENAI_MODEL || 'gpt-4.1-mini'
                const useGemini =
                  model.toLowerCase().startsWith('gemini-') || (!!geminiApiKey && !openaiApiKey)
                let text = ''

                const callOpenAI = async (fallbackReason = null) => {
                  if (!openaiApiKey) {
                    throw new Error(
                      fallbackReason
                        ? `${fallbackReason}. OpenAI fallback key not configured.`
                        : 'OpenAI key not configured.'
                    )
                  }

                  const openaiModel = model.toLowerCase().startsWith('gemini-')
                    ? env.VITE_OPENAI_FALLBACK_MODEL || 'gpt-4.1-mini'
                    : model
                  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${openaiApiKey}`,
                    },
                    body: JSON.stringify({
                      model: openaiModel,
                      messages: [
                        {
                          role: 'system',
                          content:
                            'Write clear and simple coaching language. Avoid jargon and long complex sentences.',
                        },
                        { role: 'user', content: prompt },
                      ],
                      max_tokens: 2200,
                    }),
                  })

                  if (!openaiResponse.ok) {
                    const errorText = await openaiResponse.text()
                    throw new Error(`OpenAI API error ${openaiResponse.status}: ${errorText}`)
                  }

                  const openaiData = await openaiResponse.json()
                  return openaiData?.choices?.[0]?.message?.content || ''
                }

                if (useGemini) {
                  const geminiModel = model.toLowerCase().startsWith('gemini-')
                    ? model
                    : 'gemini-2.5-flash'

                  const candidateModels = Array.from(
                    new Set([geminiModel, 'gemini-2.5-flash', 'gemini-2.5', 'gemini-1.5-flash', 'gemini-1.5'])
                  )

                  const geminiUrls = candidateModels.flatMap((candidateModel) => [
                    { url: `https://generativelanguage.googleapis.com/v1/models/${candidateModel}:generateContent?key=${geminiApiKey}` },
                    { url: `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${geminiApiKey}` },
                  ])

                  let geminiResponse = null
                  const errors = []

                  for (const config of geminiUrls) {
                    geminiResponse = await fetch(config.url, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: {
                          temperature: 0.5,
                          maxOutputTokens: 3500,
                          candidateCount: 1,
                        },
                      }),
                    })

                    if (geminiResponse.ok) {
                      break
                    }

                    const errorText = await geminiResponse.text()
                    errors.push(`(${geminiResponse.status}) ${config.url} -> ${errorText}`)
                  }

                  if (!geminiResponse || !geminiResponse.ok) {
                    text = await callOpenAI(`Gemini API failed for all tried models: ${errors.join(' | ')}`)
                  } else {
                    const geminiData = await geminiResponse.json()
                    text = geminiData?.candidates?.[0]?.content?.parts
                      ?.map((part) => part?.text || '')
                      .join('\n')
                      .trim() || ''
                  }
                } else {
                  text = await callOpenAI()
                }

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ text }))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                const message = error instanceof Error ? error.message : String(error)
                res.end(JSON.stringify({ error: message || 'Unknown proxy error' }))
              }
            })
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
