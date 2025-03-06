import React, { useState } from 'react';
import '../Components/Styles/walletmodal.css';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

const WalletModal = ({ onClose, onConnect, onProceedWithoutWallet }) => {
  const [customName, setCustomName] = useState('');
  const { publicKey, connected } = useSolanaWallet();

  const handleConnect = () => {
    if (connected && publicKey) {
      // Only call onConnect if the wallet is connected
      onConnect(customName);
    } else {
      console.log('Wallet not connected yet. Please wait.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Connect Your Wallet</h2>
        <p>
          To log your score on the leaderboard, please connect your Phantom wallet. Without connecting, you can still play, but your score won’t be recorded.
        </p>
        <input
          type="text"
          placeholder="Enter your name for the leaderboard"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
        />
        <div className="modal-buttons">
          <WalletMultiButton
            onClick={handleConnect}
            style={{ background: 'var(--score-color)', color: '#000' }}
          >
            Connect Wallet
          </WalletMultiButton>
          <button onClick={onProceedWithoutWallet}>Play Without Connecting</button>
        </div>
        <button className="close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default WalletModal;