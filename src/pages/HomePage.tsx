import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Simulated list of games
const allGames = [
  { id: 1, name: 'Room A', players: 6 },
  { id: 2, name: 'Room B', players: 2 },
  { id: 3, name: 'Room C', players: 9 },
  { id: 4, name: 'Room D', players: 1 },
  { id: 5, name: 'Room E', players: 5 },
  { id: 6, name: 'Room F', players: 7 },
  { id: 7, name: 'Room G', players: 3 },
  { id: 8, name: 'Room H', players: 0 },
];

export default function HomePage({ username = 'Player' }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [games,setGames] = useState<{ gameId:string, id: number; ganeName: string; users: any[];company:string;}[]>([]);
  const [page, setPage] = useState(1);
  const [user,setUser] =useState<{id:number , username: string}>({id : 0,username:"none"});
  const itemsPerPage = 4;
  const navigate = useNavigate();

  const totalPages = Math.ceil(allGames.length / itemsPerPage);
  const currentGames = games.slice((page - 1) * itemsPerPage, page * itemsPerPage);


  const token = window.localStorage.getItem("token");
  
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const response = await api.get('/users/me');
        if (!response.data) {
          
          return;
        }
        setUser(response.data);
      } catch (error) {
        console.error('User fetch error:', error);
        localStorage.removeItem('token');
        window.location.reload();
      }
    };

    fetchUser();
  }, [token]);

  // Fetch active games
  useEffect(() => {
    if (!token) return;

    const fetchGames = async () => {
      try {
        const response = await api.get('/game-session/active');
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching games:', error);
        alert('Failed to fetch games');
      }
    };

    fetchGames();
  }, [token]);
  const handleCreateGame = async () => {
  try {
    const response = await axios.post('http://localhost:3000/game-session/create', {
      host: user.username ,
    });

    const gameData = response.data;

    // Store game session in localStorage or your global store
    localStorage.setItem('currentGame', JSON.stringify(gameData));

    // Navigate to game page
    navigate('/game');
  } catch (error: any) {
    console.error('Failed to create game:', error);
    alert('Error creating game session');
  }
};
  const handleJoin = (gameId: number) => alert(`Joining Game ID: ${gameId}`);
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white flex flex-col items-center p-6 relative overflow-hidden">
      
      {/* Top Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        {/* Logo */}
        <div className='flex items-center'><img src="/logo.png" alt="Game Logo" className="w-16 mb-6 drop-shadow-lg" />
        <p className="text-lg font-semibold ">Hi, {username} 👋</p></div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold"
        >
          Logout
        </button>
      </div>

      

      {/* Create Game */}
      <button
        onClick={handleCreateGame}
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
                <p className="text-lg font-semibold">{`Room`+game.id}</p>
                <p className="text-sm text-gray-400">{game.users.length} / 10 Players</p>
              </div>
              <button
                onClick={() => handleJoin(game.id)}
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
              In GuessTheNumber, players take turns to guess a secret number between a defined range. The game gives hints whether the guess is too high or too low. First player to guess the number wins!
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
