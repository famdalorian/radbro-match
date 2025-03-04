import React, { useState, useEffect } from 'react';
import './App.css';

// Tile Component
const Tile = ({
  image,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isSelected,
  isMatched,
  isDropping,
  isSwapping,
  swapDirection,
}) => (
  <div
    className={`tile ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${isDropping ? 'dropping' : ''} ${isSwapping ? `swapping-${swapDirection}` : ''}`}
    onClick={onClick}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
  >
    <div className="tile-inner">{image && <img src={image} alt="NFT Tile" className="nft-image" />}</div>
  </div>
);

// Score Popup Component
const ScorePopup = ({ points, x, y }) => (
  <div className="score-popup" style={{ left: x, top: y }}>
    +{points}
  </div>
);

// Grid Component
const Grid = ({
  grid,
  handleTileClick,
  selectedTile,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  matchedTiles,
  droppingTiles,
  scorePopups,
  swappingTiles,
}) => (
  <div className="grid">
    {grid.map((row, rowIndex) =>
      row.map((image, colIndex) => {
        const swapInfo = swappingTiles.find(([r, c]) => r === rowIndex && c === colIndex);
        return (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            image={image}
            onClick={() => handleTileClick(rowIndex, colIndex)}
            onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            isSelected={selectedTile?.row === rowIndex && selectedTile?.col === colIndex}
            isMatched={matchedTiles.some(([r, c]) => r === rowIndex && c === colIndex)}
            isDropping={droppingTiles.some(([r, c]) => r === rowIndex && c === colIndex)}
            isSwapping={!!swapInfo}
            swapDirection={swapInfo?.[2]}
          />
        );
      })
    )}
    {scorePopups.map((popup, index) => (
      <ScorePopup key={index} points={popup.points} x={popup.x} y={popup.y} />
    ))}
  </div>
);

// Utility Functions
const checkMatches = (grid) => {
  const matches = [];

  // Horizontal Matches (3+)
  for (let i = 0; i < 6; i++) {
    let count = 1;
    let startCol = 0;
    for (let j = 1; j < 6; j++) {
      if (grid[i][j] && grid[i][j] === grid[i][j - 1]) {
        count++;
      } else {
        if (count >= 3) matches.push({ row: i, cols: Array.from({ length: count }, (_, k) => startCol + k) });
        count = 1;
        startCol = j;
      }
    }
    if (count >= 3) matches.push({ row: i, cols: Array.from({ length: count }, (_, k) => startCol + k) });
  }

  // Vertical Matches (3+)
  for (let j = 0; j < 6; j++) {
    let count = 1;
    let startRow = 0;
    for (let i = 1; i < 6; i++) {
      if (grid[i][j] && grid[i][j] === grid[i - 1][j]) {
        count++;
      } else {
        if (count >= 3) matches.push({ col: j, rows: Array.from({ length: count }, (_, k) => startRow + k) });
        count = 1;
        startRow = i;
      }
    }
    if (count >= 3) matches.push({ col: j, rows: Array.from({ length: count }, (_, k) => startRow + k) });
  }

  // 2x2 Square Matches
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const topLeft = grid[i][j];
      if (
        topLeft &&
        topLeft === grid[i][j + 1] &&
        topLeft === grid[i + 1][j] &&
        topLeft === grid[i + 1][j + 1]
      ) {
        matches.push({
          square: true,
          positions: [[i, j], [i, j + 1], [i + 1, j], [i + 1, j + 1]],
        });
      }
    }
  }

  return matches;
};

const createInitialGrid = (images) => {
  let grid = Array(6).fill().map(() => Array(6).fill().map(() => images[Math.floor(Math.random() * images.length)]));
  let matches = checkMatches(grid);
  while (matches.length > 0) {
    matches.forEach((match) => {
      if (match.square) {
        const [row, col] = match.positions[Math.floor(Math.random() * 4)];
        grid[row][col] = images[Math.floor(Math.random() * images.length)];
      } else {
        const pos = match.row !== undefined
          ? [match.row, match.cols[Math.floor(Math.random() * match.cols.length)]]
          : [match.rows[Math.floor(Math.random() * match.rows.length)], match.col];
        grid[pos[0]][pos[1]] = images[Math.floor(Math.random() * images.length)];
      }
    });
    matches = checkMatches(grid);
  }
  return grid;
};

function App() {
  const nftImages = [
    'https://i.seadn.io/s/raw/files/1b3db129c621b308b6ca77c761010562.png?auto=format&dpr=1&w=2048',
    'https://i.seadn.io/s/raw/files/46c0bdbfc4e1fdc800e161597e9f870a.png?auto=format&dpr=1&w=2048',
    'https://i.seadn.io/s/raw/files/863a51981595de21bdc6933a55a63c32.png?auto=format&dpr=1&w=3840',
    'https://i.seadn.io/s/raw/files/d44b1c722776727e95ed3b2f202fdf87.png?auto=format&dpr=1&w=3840',
    'https://i.seadn.io/s/raw/files/d41e3e71bc13c91b67bb3e822c4a8bb9.png?auto=format&dpr=1&w=3840',
  ];

  const sounds = {
    swap: new Audio('/Sounds/swoosh.mp3'),
    match: new Audio('/Sounds/match.mp3'),
    drop: new Audio('/Sounds/plop.mp3'),
  };
  Object.values(sounds).forEach((sound) => (sound.preload = 'auto'));

  const [grid, setGrid] = useState(() => createInitialGrid(nftImages));
  const [selectedTile, setSelectedTile] = useState(null);
  const [score, setScore] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [matchedTiles, setMatchedTiles] = useState([]);
  const [droppingTiles, setDroppingTiles] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);
  const [swappingTiles, setSwappingTiles] = useState([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(20);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'

  useEffect(() => {
    const unlockAudio = () => {
      Object.values(sounds).forEach((sound) => {
        sound.play().then(() => sound.pause()).catch(() => {});
        sound.currentTime = 0;
      });
      setIsAudioUnlocked(true);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('click', unlockAudio);
    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
  }, []);

  const clearAndRefill = async (currentGrid) => {
    let newGrid = [...currentGrid.map(row => [...row])];
    let totalPoints = 0;
    let allMatchedPositions = [];

    const processMatches = () => {
      const matches = checkMatches(newGrid);
      if (matches.length === 0) return false;

      let points = 0;
      let matchedPositions = [];
      matches.forEach((match) => {
        if (match.square) {
          match.positions.forEach(([row, col]) => {
            matchedPositions.push([row, col]);
            newGrid[row][col] = null;
          });
          points += 50; // Bonus for 2x2 square
        } else if (match.row !== undefined) {
          match.cols.forEach((col) => {
            matchedPositions.push([match.row, col]);
            newGrid[match.row][col] = null;
            points += 10;
          });
          if (match.cols.length === 4) points += 20;
          if (match.cols.length >= 5) points += 50;
        } else {
          match.rows.forEach((row) => {
            matchedPositions.push([row, match.col]);
            newGrid[row][match.col] = null;
            points += 10;
          });
          if (match.rows.length === 4) points += 20;
          if (match.rows.length >= 5) points += 50;
        }
      });

      totalPoints += points;
      allMatchedPositions = [...allMatchedPositions, ...matchedPositions];
      setMatchedTiles(matchedPositions);
      if (isAudioUnlocked) sounds.match.play();

      if (matchedPositions.length > 0) {
        const [row, col] = matchedPositions[Math.floor(matchedPositions.length / 2)];
        const x = col * 84 + 42;
        const y = row * 84 + 42;
        setScorePopups((prev) => [...prev, { points, x, y }]);
        setTimeout(() => setScorePopups((prev) => prev.filter((p) => p.points !== points)), 1000);
      }
      return true;
    };

    while (processMatches()) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setMatchedTiles([]);

      let droppingPositions = [];
      for (let col = 0; col < 6; col++) {
        let column = newGrid.map(row => row[col]).filter(Boolean);
        while (column.length < 6) {
          column.unshift(nftImages[Math.floor(Math.random() * nftImages.length)]);
          droppingPositions.push([6 - column.length, col]);
        }
        for (let row = 0; row < 6; row++) {
          newGrid[row][col] = column[row];
        }
      }
      setDroppingTiles(droppingPositions);
      if (isAudioUnlocked) sounds.drop.play();
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDroppingTiles([]);
    }

    setScore((prev) => {
      const newScore = prev + totalPoints;
      const scoreGoal = level * 500; // e.g., 500, 1000, 1500 per level
      if (newScore >= scoreGoal && movesLeft > 0) {
        setLevel((prevLevel) => prevLevel + 1);
        setMovesLeft(20);
        setGameState('won');
        setTimeout(() => {
          setGrid(createInitialGrid(nftImages));
          setGameState('playing');
        }, 2000);
      }
      return newScore;
    });
    setGrid(newGrid);
  };

  const attemptSwap = (row, col) => {
    if (!selectedTile || gameState !== 'playing') return;
    const { row: prevRow, col: prevCol } = selectedTile;
    const isAdjacent =
      (Math.abs(prevRow - row) === 1 && prevCol === col) ||
      (Math.abs(prevCol - col) === 1 && prevRow === row);

    if (isAdjacent) {
      const direction = prevRow !== row ? 'vertical' : 'horizontal';
      setSwappingTiles([[prevRow, prevCol, direction], [row, col, direction]]);
      if (isAudioUnlocked) sounds.swap.play();

      setMovesLeft((prev) => {
        const newMoves = prev - 1;
        if (newMoves <= 0) {
          setGameState('lost');
          setTimeout(() => {
            setGrid(createInitialGrid(nftImages));
            setScore(0);
            setLevel(1);
            setMovesLeft(20);
            setGameState('playing');
          }, 2000);
        }
        return newMoves;
      });

      setGrid((prevGrid) => {
        const newGrid = prevGrid.map(row => [...row]);
        [newGrid[prevRow][prevCol], newGrid[row][col]] = [newGrid[row][col], newGrid[prevRow][prevCol]];
        setTimeout(() => setSwappingTiles([]), 300);
        clearAndRefill(newGrid);
        return newGrid;
      });
    }
    setSelectedTile(null);
    setTouchStart(null);
  };

  const handleTileClick = (row, col) => {
    selectedTile ? attemptSwap(row, col) : setSelectedTile({ row, col });
  };

  const handleTouchStart = (e, row, col) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, row, col });
    setSelectedTile({ row, col });
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !selectedTile) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const threshold = 20;

    const { row, col } = touchStart;
    let targetRow = row;
    let targetCol = col;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      targetCol += deltaX > 0 ? 1 : -1;
    } else if (Math.abs(deltaY) > threshold) {
      targetRow += deltaY > 0 ? 1 : -1;
    }

    if (targetRow >= 0 && targetRow < 6 && targetCol >= 0 && targetCol < 6) {
      attemptSwap(targetRow, targetCol);
    } else {
      setSelectedTile(null);
      setTouchStart(null);
    }
  };

  return (
    <div className="App">
      <h1 className="title">Radbro Match</h1>
      <div className="score">Score: {score}</div>
      <div className="level">Level: {level} | Moves Left: {movesLeft}</div>
      {gameState === 'won' && <div className="game-message">Level Up!</div>}
      {gameState === 'lost' && <div className="game-message">Game Over!</div>}
      <Grid
        grid={grid}
        handleTileClick={handleTileClick}
        selectedTile={selectedTile}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        matchedTiles={matchedTiles}
        droppingTiles={droppingTiles}
        scorePopups={scorePopups}
        swappingTiles={swappingTiles}
      />
    </div>
  );
}

export default App;