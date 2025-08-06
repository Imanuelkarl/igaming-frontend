import { useState } from 'react';
import api from '../api';
//import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
//const navigate = useNavigate();

  const handleSubmit = async (e : any) => {
    e.preventDefault();
  try {
    const response = await api.post(`/auth/${mode}`, { username });

    if (!response.data) {
      const errorData = await response.data;
      throw new Error(errorData.message || 'Authentication failed');
    }

    const data = await response.data;
    alert(`${mode === 'login' ? 'Logged in' : 'Registered'} as ${username}`);

    // You can also store the user/token here if needed
    localStorage.setItem('token', data.access_token);
    window.location.reload() // example navigation

    return data;
  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center text-white">
      {/* Logo Placeholder */}
      <img src="/logo.png" alt="GuessTheNumber Logo" className="w-40 mb-6 drop-shadow-lg" />

      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-80 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all py-2 rounded font-semibold"
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm">
          {mode === 'login' ? (
            <>
              New player?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-purple-400 hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-purple-400 hover:underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
