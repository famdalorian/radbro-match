import React, { useState, useEffect } from 'react';
import './App.css';
import Radmatch from './Components/Radmatch';
import GameMenu from './Components/GameMenu';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles'; // Using tsparticles v2
import { AnimatePresence } from 'framer-motion';
import { FaBars } from 'react-icons/fa';

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

  // Particle initialization for tsparticles v2
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesOptions = {
    particles: {
      number: {
        value: 50,
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
        value: 0.5,
        random: true,
      },
      size: {
        value: 3,
        random: true,
      },
      move: {
        enable: true,
        speed: 1,
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
    },
  };

  if (gameState !== 'menu') {
    return (
      <div className="App">
        {gameState === 'radmatch' && (
          <Radmatch
            difficulty={difficulty}
            highScore={highScore}
            updateHighScore={updateHighScore}
            onGameOver={onGameOver}
          />
        )}
        <div className="footer">
          Built by <a href="https://x.com/Famdalorian" target="_blank" rel="noopener noreferrer">
            @Famdalorian
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="App home">
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
      <div className="hamburger-menu">
        <FaBars className="menu-icon" onClick={() => setIsMenuOpen(true)} />
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <GameMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onSelectGame={startGame}
          />
        )}
      </AnimatePresence>
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
      <div className="footer">
        Built by <a href="https://x.com/Famdalorian" target="_blank" rel="noopener noreferrer">
          @Famdalorian
        </a>
      </div>
    </div>
  );
}

export default App;