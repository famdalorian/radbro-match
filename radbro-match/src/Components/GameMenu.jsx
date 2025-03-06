import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import '../Components/Styles/gamemenu.css';

const GameMenu = ({ isOpen, onClose, onSelectGame, goToLeaderboard, backToMenu }) => {
  const games = [
    { name: 'Radbro Match', key: 'radmatch', available: true },
    { name: 'Molady Puzzle', key: 'molady-puzzle', available: false },
    { name: 'Kawamii Quest', key: 'kawamii-quest', available: false },
  ];

  const navLinks = [
    { name: 'Home', action: backToMenu || (() => { console.log('backToMenu not provided'); onClose(); }) }, // Use backToMenu with fallback
    { name: 'Play Game', action: () => onSelectGame('easy', 'radmatch') },
    { name: 'Leaderboard', action: goToLeaderboard || (() => { console.log('goToLeaderboard not provided'); onClose(); }) },
    { name: 'About', action: () => { onClose(); } },
  ];

  return (
    <motion.div
      className="game-menu"
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{ zIndex: 2000 }}
    >
      <div className="menu-header">
        <h2>Menu</h2>
        <FaTimes className="close-icon" onClick={onClose} />
      </div>

      <div className="nav-section">
        <h3>Navigation</h3>
        <ul className="nav-list">
          {navLinks.map((link) => (
            <li key={link.name} className="nav-item">
              <a href="#" onClick={(e) => { e.preventDefault(); link.action(); }}>
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="games-section">
        <h3>Games</h3>
        <ul className="game-list">
          {games.map((game) => (
            <li key={game.key} className="game-item">
              <span>{game.name} {game.available ? '' : '(Coming Soon)'}</span>
              {game.available && (
                <div className="difficulty-options">
                  <button onClick={() => { onSelectGame('easy', game.key); onClose(); }}>Easy</button>
                  <button onClick={() => { onSelectGame('medium', game.key); onClose(); }}>Medium</button>
                  <button onClick={() => { onSelectGame('hard', game.key); onClose(); }}>Hard</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default GameMenu;