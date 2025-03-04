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
  const tileSets = [
    // Set 1: Radbro NFTs (Levels 1-3)
    [
      'https://i.seadn.io/s/raw/files/1b3db129c621b308b6ca77c761010562.png?auto=format&dpr=1&w=2048',
      'https://i.seadn.io/s/raw/files/46c0bdbfc4e1fdc800e161597e9f870a.png?auto=format&dpr=1&w=2048',
      'https://i.seadn.io/s/raw/files/863a51981595de21bdc6933a55a63c32.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/d44b1c722776727e95ed3b2f202fdf87.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/d41e3e71bc13c91b67bb3e822c4a8bb9.png?auto=format&dpr=1&w=3840',
    ],
    // Set 2: Molady NFTs (Levels 4-6)
    [
      'https://i.seadn.io/s/raw/files/12d66ecc90acaece8f84c03915dcb0cf.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/ee6097c1412cb01465fa7c13eae63cee.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/365c4b54904af1e318f78dd1fb0268a2.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/e81debeec37c33fc8895a5bed5fa4520.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/5eceb118fc51a8be5954a20ac1921055.png?auto=format&dpr=1&w=3840',
    ],
    // Set 3: Kawamii NFTs (Levels 7-9)
    [
      'https://i.seadn.io/s/raw/files/9710f595aaf70d8b970b72e250a653bf.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/3ac7de9467480707bb0923b403fdeb39.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/2d4e72f52c7a528f406a51222e0c905c.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/b46fd2fe0fa7240f892770bc164777a0.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/f6508b27dd3f3d0cc38eae4e12164152.png?auto=format&dpr=1&w=3840',
    ],
  ];

  const difficulties = {
    easy: { moves: 25, time: 60, scoreBase: 300 },
    medium: { moves: 20, time: 45, scoreBase: 500 },
    hard: { moves: 15, time: 30, scoreBase: 700 },
  };

  const sounds = {
    default: {
      swap: new Audio('/Sounds/swoosh.mp3'),
      match: new Audio('/Sounds/match.mp3'),
      drop: new Audio('/Sounds/plop.mp3'),
    },
    level2: {
      swap: new Audio('/Sounds/swoosh2.mp3'),
      match: new Audio('/Sounds/match2.mp3'),
      drop: new Audio('/Sounds/plop2.mp3'),
    },
    level3: {
      swap: new Audio('/Sounds/swoosh3.mp3'),
      match: new Audio('/Sounds/match3.mp3'),
      drop: new Audio('/Sounds/plop3.mp3'),
    },
  };
  Object.values(sounds.default).forEach((sound) => (sound.preload = 'auto'));
  Object.values(sounds.level2).forEach((sound) => (sound.preload = 'auto'));
  Object.values(sounds.level3).forEach((sound) => (sound.preload = 'auto'));

  const [difficulty, setDifficulty] = useState(null);
  const [grid, setGrid] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const storedHighScore = localStorage.getItem('highScore');
    return storedHighScore ? parseInt(storedHighScore, 10) : 0;
  });
  const [touchStart, setTouchStart] = useState(null);
  const [matchedTiles, setMatchedTiles] = useState([]);
  const [droppingTiles, setDroppingTiles] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);
  const [swappingTiles, setSwappingTiles] = useState([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState('menu');
  const [gameTitle, setGameTitle] = useState('Radbro Match');
  const [currentSounds, setCurrentSounds] = useState(sounds.default);
  const [showFailModal, setShowFailModal] = useState(false);

  useEffect(() => {
    const unlockAudio = () => {
      Object.values(sounds.default)
        .concat(Object.values(sounds.level2))
        .concat(Object.values(sounds.level3))
        .forEach((sound) => {
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

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowFailModal(true);
            setGameState('lost');
            setTimeout(() => {
              setShowFailModal(false);
              setGameState('menu');
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  const updateHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('highScore', newScore.toString());
    }
  };

  const startGame = (mode) => {
    setDifficulty(mode);
    const { moves, time } = difficulties[mode];
    setMovesLeft(moves);
    setTimeLeft(time);
    setLevel(1);
    setScore(0);
    setGrid(createInitialGrid(tileSets[0]));
    setGameTitle('Radbro Match');
    setCurrentSounds(sounds.default);
    setGameState('playing');
    document.documentElement.className = `theme-0`;
  };

  const resetGame = () => {
    const { moves, time } = difficulties[difficulty];
    updateHighScore(score);
    setLevel(1);
    setScore(0);
    setMovesLeft(moves);
    setTimeLeft(time);
    setGrid(createInitialGrid(tileSets[0]));
    setGameTitle('Radbro Match');
    setCurrentSounds(sounds.default);
    setGameState('menu'); // Changed to go back to menu instead of playing
  };

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
          points += 50;
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
      if (isAudioUnlocked) currentSounds.match.play();

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
      const currentTileSet = tileSets[Math.floor((level - 1) / 3) % tileSets.length];
      for (let col = 0; col < 6; col++) {
        let column = newGrid.map(row => row[col]).filter(Boolean);
        while (column.length < 6) {
          column.unshift(currentTileSet[Math.floor(Math.random() * currentTileSet.length)]);
          droppingPositions.push([6 - column.length, col]);
        }
        for (let row = 0; row < 6; row++) {
          newGrid[row][col] = column[row];
        }
      }
      setDroppingTiles(droppingPositions);
      if (isAudioUnlocked) currentSounds.drop.play();
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDroppingTiles([]);
    }

    setScore((prev) => {
      const newScore = prev + totalPoints;
      updateHighScore(newScore);
      const scoreGoal = difficulties[difficulty].scoreBase * level;
      if (newScore >= scoreGoal && movesLeft > 0 && timeLeft > 0) {
        setLevel((prevLevel) => {
          const newLevel = prevLevel + 1;
          const tileSetIndex = Math.floor((newLevel - 1) / 3) % tileSets.length;
          document.documentElement.className = `theme-${tileSetIndex}`;
          setGameTitle(
            tileSetIndex === 0 ? 'Radbro Match' : tileSetIndex === 1 ? 'Molady Match' : 'Kawamii Match'
          );
          setCurrentSounds(
            tileSetIndex === 0 ? sounds.default : tileSetIndex === 1 ? sounds.level2 : sounds.level3
          );
          setMovesLeft(difficulties[difficulty].moves - Math.floor((newLevel - 1) / 3) * 2);
          setTimeLeft(difficulties[difficulty].time - Math.floor((newLevel - 1) / 3) * 5);
          setGrid(createInitialGrid(tileSets[tileSetIndex]));
          setGameState('won');
          setTimeout(() => setGameState('playing'), 2000);
          return newLevel;
        });
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
      if (isAudioUnlocked) currentSounds.swap.play();

      setGrid((prevGrid) => {
        const tempGrid = prevGrid.map(row => [...row]);
        [tempGrid[prevRow][prevCol], tempGrid[row][col]] = [tempGrid[row][col], tempGrid[prevRow][prevCol]];
        
        const matches = checkMatches(tempGrid);
        if (matches.length > 0) {
          setMovesLeft((prev) => {
            const newMoves = prev - 1;
            if (newMoves <= 0) {
              setShowFailModal(true);
              setGameState('lost');
              setTimeout(() => {
                setShowFailModal(false);
                setGameState('menu');
              }, 2000);
            }
            return newMoves;
          });
          setTimeout(() => setSwappingTiles([]), 300);
          clearAndRefill(tempGrid);
          return tempGrid;
        } else {
          setTimeout(() => setSwappingTiles([]), 300);
          return prevGrid;
        }
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

  if (gameState === 'menu') {
    return (
      <div className="App menu">
        <h1 className="title">{gameTitle}</h1>
        <div className="high-score">High Score: {highScore}</div>
        <button className="difficulty-btn" onClick={() => startGame('easy')}>Easy</button>
        <button className="difficulty-btn" onClick={() => startGame('medium')}>Medium</button>
        <button className="difficulty-btn" onClick={() => startGame('hard')}>Hard</button>
        <div className="footer">
          Built by <a href="https://x.com/Famdalorian" target="_blank" rel="noopener noreferrer">@Famdalorian</a>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1 className="title">{gameTitle}</h1>
      <div className="high-score">High Score: {highScore}</div>
      <div className="score">Score: {score}</div>
      <div className="level">Level: {level} | Moves: {movesLeft} | Time: {timeLeft}s</div>
      {gameState === 'won' && <div className="game-message">Level Up!</div>}
      {gameState === 'lost' && showFailModal && (
        <div className="fail-modal">
          <div className="fail-modal-content">You Failed!</div>
        </div>
      )}
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
      <div className="footer">
        Built by <a href="https://x.com/Famdalorian" target="_blank" rel="noopener noreferrer">@Famdalorian</a>
      </div>
    </div>
  );
}

export default App;