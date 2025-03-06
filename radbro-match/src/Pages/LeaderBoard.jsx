import React, { useEffect, useState } from "react";
import axios from "axios"; // Add axios import
import "../Pages/Styles/leaderboard.css";

const LeaderBoard = ({ highScore, onBackToMenu }) => {
  // State to store leaderboard data
  const [scores, setScores] = useState([]);

  // Fetch leaderboard data from backend
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leaderboard');
        console.log('Leaderboard data:', response.data); // Debug log
        setScores(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to static data if fetch fails (optional)
        setScores([
          { rank: 1, name: "Player1", score: highScore || 1000 },
          { rank: 2, name: "Player2", score: 800 },
          { rank: 3, name: "Player3", score: 600 },
          { rank: 4, name: "Player4", score: 400 },
          { rank: 5, name: "Player5", score: 200 },
        ]);
      }
    };
    fetchLeaderboard();
  }, [highScore]); // Re-fetch when highScore changes

  // Add rank to each score entry
  const leaderboardData = scores.map((entry, index) => ({
    rank: index + 1,
    name: entry.name,
    score: entry.score
  }));

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Name</span>
          <span>Score</span>
        </div>
        {leaderboardData.length > 0 ? (
          leaderboardData.map((entry) => (
            <div key={entry.rank} className="leaderboard-row">
              <span>{entry.rank}</span>
              <span>{entry.name}</span>
              <span>{entry.score}</span>
            </div>
          ))
        ) : (
          <div className="leaderboard-row">
            <span colSpan="3">No scores available</span>
          </div>
        )}
      </div>
      <button className="back-btn" onClick={onBackToMenu}>
        Back to Home
      </button>
    </div>
  );
};

export default LeaderBoard;