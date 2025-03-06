import React from 'react';
import '../Components/Styles/navbar.css';
import { FaBars } from 'react-icons/fa';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import GameMenu from './GameMenu';

const NavBar = ({ isMenuOpen, setIsMenuOpen, onSelectGame, goToLeaderboard }) => {
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="hamburger-menu">
            <button className="menu-icon" onClick={toggleMenu}>
              <FaBars />
            </button>
          </div>
          <div className="wallet-button">
            <WalletMultiButton />
          </div>
        </div>
      </header>
      <GameMenu 
        isOpen={isMenuOpen} 
        onClose={toggleMenu} 
        onSelectGame={onSelectGame}
        goToLeaderboard={goToLeaderboard} // Ensure this is passed
      />
    </>
  );
};

export default NavBar;