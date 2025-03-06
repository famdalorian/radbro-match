import React from "react";
import "../Pages/Styles/leaderboard.css";

const LeaderBoard = ({ highScore, onBackToMenu }) => {
  // Sample leaderboard data (replace with real data later if needed)
  const leaderboardData = [
    { rank: 1, name: "Player1", score: highScore || 1000 },
    { rank: 2, name: "Player2", score: 800 },
    { rank: 3, name: "Player3", score: 600 },
    { rank: 4, name: "Player4", score: 400 },
    { rank: 5, name: "Player5", score: 200 },
  ];

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Name</span>
          <span>Score</span>
        </div>
        {leaderboardData.map((entry) => (
          <div key={entry.rank} className="leaderboard-row">
            <span>{entry.rank}</span>
            <span>{entry.name}</span>
            <span>{entry.score}</span>
          </div>
        ))}
      </div>
      <button className="back-btn" onClick={onBackToMenu}>
        Back to Home
      </button>
    </div>
  );
};

export default LeaderBoard;
