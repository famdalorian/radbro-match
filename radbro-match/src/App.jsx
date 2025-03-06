import React, { useState, useEffect } from 'react';
import './App.css';
import Radmatch from './Components/Radmatch';
import GameMenu from './Components/GameMenu';
import LeaderBoard from './Pages/LeaderBoard';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';
import { AnimatePresence } from 'framer-motion';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import '@solana/wallet-adapter-react-ui/styles.css';
import NavBar from './Components/NavBar';
import Footer from './Components/Footer';
import axios from 'axios';
import WalletModal from './Components/WalletModal';

function App() {
  const [highScore, setHighScore] = useState(() => {
    const storedHighScore = localStorage.getItem('highScore');
    return storedHighScore ? parseInt(storedHighScore, 10) : 0;
  });
  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { publicKey, connected } = useSolanaWallet();
  const [playerName, setPlayerName] = useState('');
  const [customName, setCustomName] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (publicKey && connected) {
      const truncatedKey = publicKey.toString().slice(0, 8) + '...';
      setPlayerName(customName || truncatedKey);
    } else {
      setPlayerName('');
    }
  }, [publicKey, connected, customName]); // Added 'connected' to dependencies

  const updateHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('highScore', newScore.toString());
    }
  };

  const submitScore = async () => {
    if (!publicKey) {
      console.log('No wallet connected. Score not submitted.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/scores', {
        name: playerName,
        score: highScore,
      });
      console.log('Score submitted:', response.data);
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  const handleStartGame = (mode, game) => {
    if (!publicKey) {
      setShowWalletModal(true);
    } else {
      setDifficulty(mode);
      setGameState(game);
      setIsMenuOpen(false);
    }
  };

  const handleConnectWallet = (name) => {
    setCustomName(name);
    setShowWalletModal(false);
  };

  const handleProceedWithoutWallet = () => {
    setShowWalletModal(false);
    setDifficulty('easy');
    setGameState('radmatch');
    setIsMenuOpen(false);
  };

  const goToLeaderboard = () => {
    setGameState('leaderboard');
    setIsMenuOpen(false);
  };

  const onGameOver = () => {
    setGameState('menu');
    if (publicKey && highScore > 0) {
      submitScore();
    }
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
      <div className="App theme-0">
        <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
        <NavBar
          setIsMenuOpen={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
          onSelectGame={handleStartGame}
          goToLeaderboard={goToLeaderboard}
          backToMenu={backToMenu}
        />
        <AnimatePresence>
          {isMenuOpen && (
            <GameMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onSelectGame={handleStartGame}
              goToLeaderboard={goToLeaderboard}
              backToMenu={backToMenu}
              className={`game-menu ${isMenuOpen ? 'active' : ''}`}
            />
          )}
        </AnimatePresence>

        {showWalletModal && (
          <WalletModal
            onClose={() => setShowWalletModal(false)}
            onConnect={handleConnectWallet}
            onProceedWithoutWallet={handleProceedWithoutWallet}
          />
        )}

        {gameState === 'menu' ? (
          <div className="home-content">
            <div className="hero-section">
              <h1 className="hero-title">Radmatch Games Hub</h1>
              <div className="high-score">High Score: {highScore}</div>
              <div className="player-info">
                {publicKey ? (
                  <p>Connected as: {playerName}</p>
                ) : (
                  <button onClick={() => setShowWalletModal(true)}>Connect Wallet to Play</button>
                )}
              </div>
              <div className="featured-game">
                <h2>Featured Game: Radbro Match</h2>
                <p>Match Radbro NFTs to score points in this neon-powered puzzle game!</p>
                <button
                  className="play-now-btn"
                  onClick={() => handleStartGame('easy', 'radmatch')}
                >
                  Play Now
                </button>
                <button className="leaderboard-btn" onClick={goToLeaderboard}>
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
              playerName={playerName}
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