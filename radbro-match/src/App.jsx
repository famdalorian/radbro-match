import React, { useState, useEffect } from 'react';
import './App.css';
import Radmatch from './Components/Radmatch';
import GameMenu from './Components/GameMenu';
import LeaderBoard from './Pages/LeaderBoard';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import { AnimatePresence } from 'framer-motion';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import NavBar from './Components/NavBar';
import Footer from './Components/Footer';

function App() {
  const [highScore, setHighScore] = useState(() => {
    const storedHighScore = localStorage.getItem('highScore');
    return storedHighScore ? parseInt(storedHighScore, 10) : 0;
  });
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (gameState === 'menu') {
      document.documentElement.className = 'theme-0';
    }
  }, [gameState]);

  const updateHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('highScore', newScore.toString());
    }
  };

  const startGame = (mode, game) => {
    setDifficulty(mode);
    setGameState(game);
    setIsMenuOpen(false);
  };

  const goToLeaderboard = () => {
    setGameState('leaderboard');
    setIsMenuOpen(false);
  };

  const onGameOver = () => {
    setGameState('menu');
  };

  const backToMenu = () => {
    setGameState('menu');
  };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesOptions = {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: ['#FF00FF', '#00FFFF', '#00FF00'] },
      shape: { type: 'circle' },
      opacity: { value: 0.6, random: true },
      size: { value: 30, random: { enable: true, minimumValue: 1.5 } },
      move: { enable: true, speed: 3, direction: 'none', random: true, out_mode: 'out' },
    },
    interactivity: {
      events: { onhover: { enable: true, mode: 'repulse' } },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
  };

  return (
    <WalletModalProvider>
      <div className="App">
        <NavBar 
          setIsMenuOpen={setIsMenuOpen} 
          isMenuOpen={isMenuOpen} 
          onSelectGame={startGame}
          goToLeaderboard={goToLeaderboard} // Ensure this is passed
        />
        <AnimatePresence>
          {isMenuOpen && (
            <GameMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onSelectGame={startGame}
              goToLeaderboard={goToLeaderboard} // Optional: direct pass if not via NavBar
              className={`game-menu ${isMenuOpen ? 'active' : ''}`}
            />
          )}
        </AnimatePresence>

        {gameState === 'menu' ? (
          <div className="home-content">
            <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
            <div className="hero-section">
              <h1 className="hero-title">Radmatch Games Hub</h1>
              <div className="high-score">High Score: {highScore}</div>
              <div className="featured-game">
                <h2>Featured Game: Radbro Match</h2>
                <p>Match Radbro NFTs to score points in this neon-powered puzzle game!</p>
                <button
                  className="play-now-btn"
                  onClick={() => startGame('easy', 'radmatch')}
                >
                  Play Now
                </button>
                <button
                  className="leaderboard-btn"
                  onClick={goToLeaderboard}
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        ) : gameState === 'radmatch' ? (
          <div className="game-content">
            <Radmatch
              difficulty={difficulty}
              highScore={highScore}
              updateHighScore={updateHighScore}
              onGameOver={onGameOver}
            />
          </div>
        ) : gameState === 'leaderboard' ? (
          <div className="leaderboard-content">
            <LeaderBoard highScore={highScore} onBackToMenu={backToMenu} />
          </div>
        ) : null}

        <Footer />
      </div>
    </WalletModalProvider>
  );
}

export default App;