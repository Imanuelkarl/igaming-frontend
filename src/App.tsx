// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { Box } from '@mui/material';
import './App.css'

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Box minHeight="100vh" bgcolor="#f5f5f5">
        <Routes>
          <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} />
          <Route path="/" element={isAuthenticated ? <HomePage username='Emma' /> : <Navigate to="/auth" />} />
          <Route path="/game" element={isAuthenticated ? <GamePage /> : <Navigate to="/auth" />} />
          <Route path="/leaderboard" element={isAuthenticated ? <LeaderboardPage /> : <Navigate to="/auth" />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;