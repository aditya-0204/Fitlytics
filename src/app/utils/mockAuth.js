// Mock user database
const mockUsers = [
  {
    username: 'coach',
    password: 'coach123',
    user: {
      id: 'coach-1',
      username: 'coach',
      role: 'coach',
      name: 'Coach Anderson',
      sportType: 'Football',
      coachType: 'Head Coach',
    },
  },
  {
    username: 'sangeeta',
    password: 'sangeeta123',
    user: {
      id: 'user-1',
      username: 'sarah',
      role: 'player',
      playerId: '1', // Links to sangeeta phogat in teamPlayers
      name: 'sangeeta phogat',
    },
  },
  {
    username: 'mike',
    password: 'abhishek123',
    user: {
      id: 'user-2',
      username: 'abhishek',
      role: 'player',
      playerId: '2', // Links to abhishek singh in teamPlayers
      name: 'abhishek singh',
    },
  },
  {
    username: 'ellyse',
    password: 'ellyse123',
    user: {
      id: 'user-3',
      username: 'ellyse',
      role: 'player',
      playerId: '3', // Links to ellyse perry in teamPlayers
      name: 'ellyse perry',
    },
  },
  {
    username: 'Sreejesh',
    password: 'Sreejesh123',
    user: {
      id: 'user-4',
      username: 'Sreejesh',
      role: 'player',
      playerId: '4', // Links to PR Sreejesh in teamPlayers
      name: 'PR Sreejesh',
    },
  },
];

const USER_STORAGE_KEY = 'athleteDashboardRegisteredUsers';

function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function getAllUsers() {
  return [...mockUsers, ...getStoredUsers()];
}

export function authenticateUser(username, password) {
  const userRecord = getAllUsers().find(
    (u) => u.username === username && u.password === password
  );
  return userRecord ? userRecord.user : null;
}

export function registerUser({ name, username, password, role, sportType, coachType }) {
  const normalizedUsername = (username || '').trim();
  const normalizedName = (name || '').trim();

  if (!normalizedUsername || !normalizedName || !password) {
    return { ok: false, error: 'Name, username, and password are required.' };
  }

  const exists = getAllUsers().some(
    (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase()
  );
  if (exists) {
    return { ok: false, error: 'Username already exists. Choose another username.' };
  }

  if (role === 'coach' && (!sportType || !coachType)) {
    return { ok: false, error: 'Sport type and coach type are required for coach signup.' };
  }

  const createdUser = {
    id: `${role}-${Date.now()}`,
    username: normalizedUsername,
    role: role || 'player',
    name: normalizedName,
    ...(role === 'coach' ? { sportType, coachType } : {}),
  };

  const record = {
    username: normalizedUsername,
    password,
    user: createdUser,
  };

  const stored = getStoredUsers();
  stored.push(record);
  saveStoredUsers(stored);

  return { ok: true, user: createdUser };
}
