
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Simulated list of games
/*const all_Games = [
  { id: 1, name: 'Room A', players: 6 },
  { id: 2, name: 'Room B', players: 2 },
  { id: 3, name: 'Room C', players: 9 },
  { id: 4, name: 'Room D', players: 1 },
  { id: 5, name: 'Room E', players: 5 },
  { id: 6, name: 'Room F', players: 7 },
  { id: 7, name: 'Room G', players: 3 },
  { id: 8, name: 'Room H', players: 0 },
];*/



export default function HomePage() {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allGames, setAll_Games] = useState<Game[]>([]);
  const totalPages = Math.ceil(allGames.length / itemsPerPage);
  
  const currentGames = Array.isArray(allGames)
  ? allGames.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  : [];
  
  interface Game{
    id: number;
    name: string;
    hostId: number;
    winnerId: number;
    span: number;
    startTime: string;
    state: string;
    users: []
  }

  interface User {
    id: number;
    username: string;
  }
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        return;
      }

      try {
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
       
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user');
        console.log(error)
      }
    };

    fetchUser();
  }, []);
  useEffect(() => {
    
    const checkSession = async () => {
      try {
        const response = await api.get('/game-session/my-session');
        console.log('useEffect running');
        console.log(response)
        if (response.data ) {
          // Session exists
          console.log(response);
          navigate('/game');
        }
      } catch (err) {
        // No active session or error occurred
        console.log('No active session:');
      }
    };

    checkSession();
  }, []);
   useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/game-session/active');
        if (Array.isArray(response.data.session)) {
          setAll_Games(response.data.session);
        }// Assuming the response is an array of games
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load games');
      }
    };

    fetchGames();
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };
  const createGame = async () => {
  try {
    const response = await api.post('/game-session/create');
    console.log('Game created:', response.data);
    // Navigate to /game if successful
    window.location.href = '/game';
  } catch (err) {
    console.error('Failed to create game:', err);
  }
};

const joinGame = async (sessionId: number) => {
  try {
    const response = await api.post('/game-session/join', {
      sessionId,
      selectedNumber: 0,
    });
    console.log('Joined game:', response.data);
    window.location.href = '/game';
  } catch (err) {
    console.error('Failed to join game:', err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white flex flex-col items-center p-6 relative overflow-hidden">
      
      {/* Top Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        {/* Logo */}
        <div className='flex items-center'><img src="/logo.png" alt="Game Logo" className="w-16 mb-6 drop-shadow-lg" />
        <p className="text-lg font-semibold ">Hi, {user?.username} 👋</p></div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold"
        >
          Logout
        </button>
      </div>

      

      {/* Create Game */}
      <button
        onClick={createGame}
        className="mb-6 bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-xl text-lg font-bold shadow-lg"
      >
        + Create New Game
      </button>

      {/* Game List */}
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl p-6 shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">Available Games</h2>
        <div className="space-y-4 max-h-[400px] overflow-hidden">
          {currentGames.map((game) => (
            <div
              key={game.id}
              className="flex justify-between items-center bg-gray-800 p-4 rounded-xl"
            >
              <div>
                <p className="text-lg font-semibold">{game.name}</p>
                <p className="text-sm text-gray-400">{game.users.length} / 10 Players</p>
              </div>
              <button
                onClick={() => joinGame(game.id)}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-semibold"
              >
                Join
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded ${
              page === 1
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <span className="text-sm mt-1">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded ${
              page === totalPages
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Bottom Options */}
      <div className="grid grid-cols-3 gap-6 text-center">
        <button
          onClick={() => setShowHowToPlay(true)}
          className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl shadow"
        >
          How to Play
        </button>

        <button className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl shadow">
          Leaderboard
        </button>

        <button className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl shadow">
          Achievements
        </button>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-lg text-center">
            <h3 className="text-xl font-bold mb-4">How to Play</h3>
            <p className="text-sm text-gray-300 mb-4">
              In GuessTheNumber, players take turns to guess a secret number between a defined range. First player to guess the number wins!
            </p>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
