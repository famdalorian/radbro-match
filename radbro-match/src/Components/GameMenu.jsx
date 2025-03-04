import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import '../Components/Styles/gamemenu.css'; // Import the new stylesheet

const GameMenu = ({ isOpen, onClose, onSelectGame }) => {
  const games = [
    {
      name: 'Radbro Match',
      key: 'radmatch',
      available: true,
    },
    {
      name: 'Molady Puzzle',
      key: 'molady-puzzle',
      available: false,
    },
    {
      name: 'Kawamii Quest',
      key: 'kawamii-quest',
      available: false,
    },
  ];

  return (
    <motion.div
      className="game-menu"
      initial={{ x: '-100%' }}
      animate={{ x: isOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="menu-header">
        <h2>Games</h2>
        <FaTimes className="close-icon" onClick={onClose} />
      </div>
      <ul className="game-list">
        {games.map((game) => (
          <li key={game.key} className="game-item">
            <span>{game.name} {game.available ? '' : '(Coming Soon)'}</span>
            {game.available && (
              <div className="difficulty-options">
                <button onClick={() => onSelectGame('easy', game.key)}>Easy</button>
                <button onClick={() => onSelectGame('medium', game.key)}>Medium</button>
                <button onClick={() => onSelectGame('hard', game.key)}>Hard</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default GameMenu;