import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/*const mockPlayers = [
  { id: 1, username: 'Emmanuel', isHost: true },
  { id: 2, username: 'Lara' },
  { id: 3, username: 'John' },
  { id: 4, username: 'Ada' },
  { id: 5, username: 'Jane' },
 
];*/
/*interface Game{
    id: number;
    name: string;
    creatorId: number;
    winnerId: number;
    span: number;
    startTime: string;
    state: string;
    users:User []
  }*/
  interface User {
    id: number;
    sub : number;
    username: string;
    selectedNumber: number;

  }

export default function GamePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [numberSelected, setNumberSelected] = useState<number | null>(null);
  const [winner, setWinner] = useState<String | null>(null);
  const [gameSession ,setGameSession] = useState<any>({});
  const [players,setPlayers] = useState<any[]>([]);
  const [currentUser,setCurrentUser] =useState<User>();
  const [winners, setWinners] = useState<any[]>([]);
  const [gameEnded,setGameEnded] = useState(false);


  const [isHost,checkIsHost]  =useState(players.find((p) => p.user.username === gameSession.creatorId)?.isHost);
  const navigate = useNavigate();
  // Countdown timer when game starts
  useEffect(() => {
      const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          
          return;
        }
  
        try {
          const response = await api.get('/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCurrentUser(response.data);
          console.log(response.data.sub);
          console.log(gameSession.creatorId);
          checkIsHost(response.data.sub===gameSession.creatorId);
         
        } catch (err: any) {
          
          console.log(err);
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
          setGameSession(response.data);
          if(!response.data|| response.data===""){
            navigate('/');
          }
          setPlayers(response.data.users);
          
          
        }
      } catch (err) {
        // No active session or error occurred
        console.log('No active session:');
      }
    };

    checkSession();
  }, []);
    useEffect(() => {
    if (currentUser && gameSession?.creatorId) {
      const isHost = currentUser.sub === gameSession.creatorId;
      checkIsHost(isHost);
    }
  }, [currentUser, gameSession]);
  useEffect(() => {
    if (gameStarted && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }

    // After countdown ends, simulate result
    if (gameStarted && countdown === 0 && !winner) {
      const simulatedWinner =
        players[Math.floor(Math.random() * players.length)];
      setWinner(simulatedWinner.username);
    }
  }, [gameStarted, countdown]);
  useEffect(() => {
  let intervalId: any;

  if (gameSession?.id && !gameStarted) {
    intervalId = setInterval(async () => {
      try {
        const response = await api.get(`/game-session/sessions/${gameSession.id}`);
        const updatedSession = response.data;

        setGameSession(updatedSession);
        setPlayers(updatedSession.users);

        // Optionally log which players haven't selected
        const notSelected = updatedSession.users.filter(
          (player: any) => player.selectedNumber === 0
        );
        if (notSelected.length > 0) {
          console.log('Players yet to select:', notSelected.map((p: { user: { username: any; }; }) => p.user.username));
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    }, 3000); // Poll every 3 seconds
  }

  return () => {
    if (intervalId) clearInterval(intervalId); // Stop polling on unmount or when game starts
  };
}, [gameSession?.id, gameStarted]);
useEffect(() => {
  let intervalId: any;

  if (gameSession?.id) {
    intervalId = setInterval(async () => {
      try {
        const response = await api.get(`/game-session/sessions/${gameSession.id}`);
        const updatedSession = response.data;

        setGameSession(updatedSession);
        setPlayers(updatedSession.users);

        // Optionally log which players haven't selected
        const notSelected = updatedSession.users.filter(
          (player: any) => player.selectedNumber === 0
        );
        if (notSelected.length > 0) {
          console.log('Players yet to select:', notSelected.map((p: { user: { username: any; }; }) => p.user.username));
        }

        // ✅ Also handle winner logic here after countdown
        if (gameStarted && countdown === 0 && updatedSession.winningNumber) {
          const winningPlayers = updatedSession.users.filter(
            (p: any) => p.isWinner
          );
          setWinners(winningPlayers);
          setGameEnded(true);
        }

      } catch (err) {
        console.error('Failed to fetch session:', err);
      }
    }, 3000);
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [gameSession?.id, gameStarted, countdown]);


    const handleStartGame = async () => {
      const notSelected = players.filter(player => player.selectedNumber === 0);

      if (notSelected.length > 0) {
        alert(
          `Cannot start the game. The following players haven't selected a number:\n` +
            notSelected.map(p => p.user.username).join(', ')
        );
        return;
      }

      try {
        const response = await api.post('/game-session/start', {
          sessionId: gameSession.id,
        });

        const updatedSession = response.data;

        setGameStarted(true);
        setCountdown(updatedSession.span);
        setGameSession(updatedSession);
        setWinner(null);
        setNumberSelected(null);

        setTimeout(() => {
          checkGameResult();
        }, updatedSession.span * 1000);
      } catch (err) {
        console.error('Error starting game:', err);
      }
    };

const checkGameResult = async () => {
  try {
    const response = await api.get(`/game-session/sessions/${gameSession.id}`);
    const updatedSession = response.data;
    console.log(updatedSession);

    setGameSession(updatedSession);

    // Filter winners
    const winningPlayers = updatedSession.users.filter(
      (p: any) => p.isWinner
    );

    setWinners(winningPlayers); // <-- New state to track winners
    setGameEnded(true);

  } catch (error) {
    console.error("Failed to fetch game result:", error);
  }
};


  const handleSelectNumber = async (num: number) => {
  setNumberSelected(num);

  try {
    await api.put('/game-session/select-number', {
      sessionId: gameSession.id,
      selectedNumber: num,
    });

    console.log('Number selected:', num);
  } catch (err) {
    console.error('Failed to select number:', err);
  }
};


  const handleLeave =async  () => {
    try{
      const response =await api.post(`/game-session/leave`,{
        sessionId:gameSession.id,
      })
      if(response.data){
        navigate("/");
      }
    }
    catch(err){
      console.log(err);
    }
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Game Lobby</h2>
        <button
          onClick={handleLeave}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold"
        >
          Leave Game
        </button>
      </div>

      {/* Lobby Players */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow relative"
          >
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold">
              {player.user.username.charAt(0).toUpperCase()}
            </div>
            <p className="mt-2 font-semibold">{player.user.username}</p>
            <span
              className={`absolute top-2 right-2 text-xs italic ${
                player.selectedNumber === 0 ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {(!player.isWinner &&player.selectedNumber === 0) ? 'Not selected' : 'Selected'}
            </span>
            {player.isWinner && (
              <span className="absolute top-2 left-2 text-green-400 font-bold text-xs">
                Winner 🏆
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Host Control */}
      {!gameStarted && isHost && (
        <div className="text-center mb-8">
          <button
            onClick={handleStartGame}
            className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl font-bold text-black shadow-lg"
          >
            Start Game
          </button>
        </div>
      )}

      {/* Countdown and Number Picker */}
      {gameStarted && countdown > 0 && (
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold mb-2">Results Shows In:</h3>
          <div className="text-5xl font-mono">{countdown}</div>
        </div>
      )}

      {/* Number Selection */}
      {!gameStarted &&!numberSelected && (
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-4">Pick a Number</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[...Array(10)].map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelectNumber(i + 1)}
                className="bg-purple-700 hover:bg-purple-800 w-12 h-12 rounded-full font-bold"
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Confirmation */}
      {numberSelected && (
        <div className="text-center text-lg mt-8">
          You selected:{" "}
          <span className="text-yellow-400 font-bold">{numberSelected}</span>
        </div>
      )}

      {gameEnded && (
  <div className="text-center mt-10 text-2xl font-bold text-green-400">
    { (
  <>
    {winners.length > 0 ? (
      <div className="text-center mt-10 text-2xl font-bold text-green-400">
        {winners.some(w => w.user.username === currentUser?.username)
          ? "🎉 You won!"
          : `🎉 ${winners.map(w => w.user.username).join(', ')} won the round!`}
      </div>
    ) : (
      <div className="text-center mt-10 text-2xl font-bold text-red-400">
        😞 No winners this round.
      </div>
    )}
  </>
)}
  </div>
)}

    </div>
  );
}
