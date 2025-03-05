import React, { useState, useEffect } from 'react';
import './App.css';
import Radmatch from './Components/Radmatch';
import GameMenu from './Components/GameMenu';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import { AnimatePresence } from 'framer-motion';
import { FaBars } from 'react-icons/fa';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'; // Import WalletMultiButton
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'; // Import WalletModalProvider
import '@solana/wallet-adapter-react-ui/styles.css'; // Import styles for the wallet UI

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

  const onGameOver = () => {
    setGameState('menu');
  };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesOptions = {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: ['#FF00FF', '#00FFFF', '#00FF00'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.6,
        random: true,
      },
      size: {
        value: 30,
        random: { enable: true, minimumValue: 1.5 },
      },
      move: {
        enable: true,
        speed: 3,
        direction: 'none',
        random: true,
        out_mode: 'out',
      },
    },
    interactivity: {
      events: {
        onhover: {
          enable: true,
          mode: 'repulse',
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
  };

  return (
    // Wrap the app content with WalletModalProvider to enable wallet selection modal
    <WalletModalProvider>
      <div className="App">
        {/* Header with hamburger menu and WalletMultiButton */}
        <div className="header">
          <div className={`hamburger-menu ${isMenuOpen ? 'hidden' : ''}`}>
            <FaBars className="menu-icon" onClick={() => setIsMenuOpen(true)} />
          </div>
          <div className="user-area">
            <WalletMultiButton /> {/* Add WalletMultiButton for wallet connection */}
          </div>
        </div>

        {/* Game Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <GameMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onSelectGame={startGame}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        {gameState === 'menu' ? (
          <div className="home-content">
            <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
            <div className="hero-section">
              <h1 className="hero-title">Radbro Games Hub</h1>
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
              </div>
            </div>
          </div>
        ) : (
          <div className="game-content">
            {gameState === 'radmatch' && (
              <Radmatch
                difficulty={difficulty}
                highScore={highScore}
                updateHighScore={updateHighScore}
                onGameOver={onGameOver}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          Built by{' '}
          <a href="https://x.com/Famdalorian" target="_blank" rel="noopener noreferrer">
            @Famdalorian
          </a>
        </div>
      </div>
    </WalletModalProvider>
  );
}

export default App;