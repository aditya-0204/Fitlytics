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
                const apiKey = env.VITE_OPENAI_API_KEY

                if (!apiKey) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ error: 'Missing VITE_OPENAI_API_KEY in .env' }))
                  return
                }

                const prompt = payload.prompt || ''
                const model = payload.model || env.VITE_OPENAI_MODEL || 'gpt-4.1-mini'
                const useGemini = apiKey.startsWith('AIza') || model.toLowerCase().startsWith('gemini-')
                let text = ''

                if (useGemini) {
                  const geminiModel = model.toLowerCase().startsWith('gemini-')
                    ? model
                    : 'gemini-2.5-flash'

                  const candidateModels = Array.from(
                    new Set([geminiModel, 'gemini-2.5-flash', 'gemini-2.5', 'gemini-1.5-flash', 'gemini-1.5'])
                  )

                  const geminiUrls = candidateModels.flatMap((candidateModel) => [
                    { url: `https://generativelanguage.googleapis.com/v1/models/${candidateModel}:generateContent?key=${apiKey}` },
                    { url: `https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${apiKey}` },
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
                          maxOutputTokens: 2200,
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
                    throw new Error(`Gemini API failed for all tried models:\n${errors.join('\n')}`)
                  }

                  const geminiData = await geminiResponse.json()
                  text = geminiData?.candidates?.[0]?.content?.parts
                    ?.map((part) => part?.text || '')
                    .join('\n')
                    .trim() || ''
                } else {
                  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                      model,
                      messages: [
                        { role: 'system', content: 'You are a helpful assistant who writes detailed paragraphs and bullet points for each section.' },
                        { role: 'user', content: prompt },
                      ],
                      max_tokens: 1000,
                    }),
                  })

                  if (!openaiResponse.ok) {
                    const errorText = await openaiResponse.text()
                    throw new Error(`OpenAI API error ${openaiResponse.status}: ${errorText}`)
                  }

                  const openaiData = await openaiResponse.json()
                  text = openaiData?.choices?.[0]?.message?.content || ''
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
