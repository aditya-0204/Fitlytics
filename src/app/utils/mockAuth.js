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

export function authenticateUser(username, password) {
  const userRecord = mockUsers.find(
    (u) => u.username === username && u.password === password
  );
  return userRecord ? userRecord.user : null;
}
