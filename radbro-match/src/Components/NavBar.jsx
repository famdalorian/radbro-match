import React, { useState } from 'react';
import '../Components/Styles/navbar.css'; // Adjusted path to match your structure
import { FaBars } from 'react-icons/fa';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="hamburger-menu">
          <button className="menu-icon" onClick={toggleMenu}>
            <FaBars />
          </button>
        </div>
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="/">HOME</a></li>
            <li><a href="/game">PLAY GAME</a></li>
            <li><a href="/leaderboard">LEADERBOARD</a></li>
            <li><a href="/about">ABOUT</a></li>
          </ul>
        </nav>
          <WalletMultiButton />
      </div>
    </header>
  );
};

export default NavBar;