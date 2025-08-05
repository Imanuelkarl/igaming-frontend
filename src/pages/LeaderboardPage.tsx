// src/pages/LeaderboardPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import axios from 'axios';

const LeaderboardPage: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [sessionsByDate, setSessionsByDate] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [playersResponse, sessionsResponse] = await Promise.all([
          axios.get('http://localhost:3000/game-session/top-players', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/game-session/sessions-by-date', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        setTopPlayers(playersResponse.data);
        setSessionsByDate(sessionsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Leaderboard
      </Typography>
      
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Top Players
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Username</TableCell>
                <TableCell align="right">Wins</TableCell>
                <TableCell align="right">Losses</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topPlayers.map((player, index) => (
                <TableRow key={player.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.username}</TableCell>
                  <TableCell align="right">{player.wins}</TableCell>
                  <TableCell align="right">{player.losses}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h5" gutterBottom>
            Sessions by Date
          </Typography>
          <FormControl sx={{ ml: 2, minWidth: 120 }} size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              label="Time Range"
            >
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Sessions</TableCell>
                <TableCell align="right">Players</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessionsByDate.map((session, index) => (
                <TableRow key={index}>
                  <TableCell>{session.date}</TableCell>
                  <TableCell align="right">{session.session_count}</TableCell>
                  <TableCell align="right">{session.player_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default LeaderboardPage;