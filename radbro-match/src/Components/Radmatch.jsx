import React, { useState, useEffect } from 'react';
import '../App.css';

// Tile Component
const Tile = ({
  image,
  powerUp,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isSelected,
  isMatched,
  isDropping,
  isSwapping,
  swapDirection,
  animation,
}) => (
  <div
    className={`tile ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${
      isDropping ? 'dropping' : ''
    } ${isSwapping ? `swapping-${swapDirection}` : ''} ${
      powerUp ? `power-up-${powerUp}` : ''
    } ${animation ? `animating-${animation}` : ''}`}
    onClick={onClick}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
  >
    <div className="tile-inner">
      {image && <img src={image} alt="NFT Tile" className="nft-image" />}
      {powerUp === 'striped-horizontal' && <div className="striped-overlay horizontal" />}
      {powerUp === 'striped-vertical' && <div className="striped-overlay vertical" />}
      {powerUp === 'bomb' && <div className="bomb-overlay" />}
    </div>
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
  tileAnimations,
}) => (
  <div className="grid">
    {grid && grid.map((row, rowIndex) =>
      row.map((tile, colIndex) => {
        const swapInfo = swappingTiles.find(([r, c]) => r === rowIndex && c === colIndex);
        return (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            image={tile?.image}
            powerUp={tile?.powerUp}
            onClick={() => handleTileClick(rowIndex, colIndex)}
            onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            isSelected={selectedTile?.row === rowIndex && selectedTile?.col === colIndex}
            isMatched={matchedTiles.some(([r, c]) => r === rowIndex && c === colIndex)}
            isDropping={droppingTiles.some(([r, c]) => r === rowIndex && c === colIndex)}
            isSwapping={!!swapInfo}
            swapDirection={swapInfo?.[2]}
            animation={tileAnimations[`${rowIndex}-${colIndex}`]}
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
  const powerUps = [];

  // Horizontal matches
  for (let i = 0; i < 6; i++) {
    let count = 1;
    let startCol = 0;
    for (let j = 1; j < 6; j++) {
      if (grid[i][j]?.image && grid[i][j]?.image === grid[i][j - 1]?.image) {
        count++;
      } else {
        if (count >= 3) {
          const cols = Array.from({ length: count }, (_, k) => startCol + k);
          matches.push({ row: i, cols });
          if (count >= 5) {
            powerUps.push({ type: 'bomb', row: i, col: cols[Math.floor(cols.length / 2)] });
          } else if (count === 4) {
            powerUps.push({ type: 'striped-horizontal', row: i, col: cols[Math.floor(cols.length / 2)] });
          }
        }
        count = 1;
        startCol = j;
      }
    }
    if (count >= 3) {
      const cols = Array.from({ length: count }, (_, k) => startCol + k);
      matches.push({ row: i, cols });
      if (count >= 5) {
        powerUps.push({ type: 'bomb', row: i, col: cols[Math.floor(cols.length / 2)] });
      } else if (count === 4) {
        powerUps.push({ type: 'striped-horizontal', row: i, col: cols[Math.floor(cols.length / 2)] });
      }
    }
  }

  // Vertical matches
  for (let j = 0; j < 6; j++) {
    let count = 1;
    let startRow = 0;
    for (let i = 1; i < 6; i++) {
      if (grid[i][j]?.image && grid[i][j]?.image === grid[i - 1][j]?.image) {
        count++;
      } else {
        if (count >= 3) {
          const rows = Array.from({ length: count }, (_, k) => startRow + k);
          matches.push({ col: j, rows });
          if (count >= 5) {
            powerUps.push({ type: 'bomb', row: rows[Math.floor(rows.length / 2)], col: j });
          } else if (count === 4) {
            powerUps.push({ type: 'striped-vertical', row: rows[Math.floor(rows.length / 2)], col: j });
          }
        }
        count = 1;
        startRow = i;
      }
    }
    if (count >= 3) {
      const rows = Array.from({ length: count }, (_, k) => startRow + k);
      matches.push({ col: j, rows });
      if (count >= 5) {
        powerUps.push({ type: 'bomb', row: rows[Math.floor(rows.length / 2)], col: j });
      } else if (count === 4) {
        powerUps.push({ type: 'striped-vertical', row: rows[Math.floor(rows.length / 2)], col: j });
      }
    }
  }

  // L and T shape detection
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const tile = grid[i][j]?.image;
      if (!tile) continue;

      // L shape: 3 horizontal + 3 vertical down from right end
      if (
        j + 2 < 6 && i + 2 < 6 &&
        tile === grid[i][j + 1]?.image && tile === grid[i][j + 2]?.image &&
        tile === grid[i + 1][j + 2]?.image && tile === grid[i + 2][j + 2]?.image
      ) {
        matches.push({
          positions: [[i, j], [i, j + 1], [i, j + 2], [i + 1, j + 2], [i + 2, j + 2]],
          powerUpTile: [i, j + 2],
          powerUpType: 'striped-horizontal'
        });
      }

      // T shape: 3 horizontal + 3 vertical down from middle
      if (
        j + 2 < 6 && i + 2 < 6 &&
        tile === grid[i][j + 1]?.image && tile === grid[i][j + 2]?.image &&
        tile === grid[i + 1][j + 1]?.image && tile === grid[i + 2][j + 1]?.image
      ) {
        matches.push({
          positions: [[i, j], [i, j + 1], [i, j + 2], [i + 1, j + 1], [i + 2, j + 1]],
          powerUpTile: [i, j + 1],
          powerUpType: 'bomb'
        });
      }
    }
  }

  return { matches, powerUps };
};

const createInitialGrid = (images) => {
  let grid = Array(6)
    .fill()
    .map(() => Array(6).fill().map(() => ({ image: images[Math.floor(Math.random() * images.length)] })));
  let { matches } = checkMatches(grid);
  while (matches.length > 0) {
    matches.forEach((match) => {
      const pos = match.positions
        ? match.positions[Math.floor(Math.random() * match.positions.length)]
        : match.row !== undefined
        ? [match.row, match.cols[Math.floor(Math.random() * match.cols.length)]]
        : [match.rows[Math.floor(Math.random() * match.rows.length)], match.col];
      grid[pos[0]][pos[1]] = { image: images[Math.floor(Math.random() * images.length)] };
    });
    matches = checkMatches(grid).matches;
  }
  return grid;
};

function Radmatch({ difficulty = 'easy', highScore = 0, updateHighScore = () => {}, onGameOver = () => {} }) {
  const tileSets = [
    [
      'https://i.seadn.io/s/raw/files/1b3db129c621b308b6ca77c761010562.png?auto=format&dpr=1&w=2048',
      'https://i.seadn.io/s/raw/files/46c0bdbfc4e1fdc800e161597e9f870a.png?auto=format&dpr=1&w=2048',
      'https://i.seadn.io/s/raw/files/863a51981595de21bdc6933a55a63c32.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/d44b1c722776727e95ed3b2f202fdf87.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/d41e3e71bc13c91b67bb3e822c4a8bb9.png?auto=format&dpr=1&w=3840',
    ],
    [
      'https://i.seadn.io/s/raw/files/12d66ecc90acaece8f84c03915dcb0cf.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/ee6097c1412cb01465fa7c13eae63cee.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/365c4b54904af1e318f78dd1fb0268a2.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/e81debeec37c33fc8895a5bed5fa4520.png?auto=format&dpr=1&w=3840',
      'https://i.seadn.io/s/raw/files/5eceb118fc51a8be5954a20ac1921055.png?auto=format&dpr=1&w=3840',
    ],
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

  const validDifficulty = difficulties[difficulty] ? difficulty : 'easy';

  const [grid, setGrid] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(difficulties[validDifficulty].moves);
  const [timeLeft, setTimeLeft] = useState(difficulties[validDifficulty].time);
  const [matchedTiles, setMatchedTiles] = useState([]);
  const [droppingTiles, setDroppingTiles] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);
  const [swappingTiles, setSwappingTiles] = useState([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [currentSounds, setCurrentSounds] = useState(sounds.default);
  const [showFailModal, setShowFailModal] = useState(false);
  const [gameTitle, setGameTitle] = useState('Radbro Match');
  const [tileAnimations, setTileAnimations] = useState({});

  useEffect(() => {
    const tileSetIndex = Math.floor((level - 1) / 3) % tileSets.length;
    document.documentElement.className = `theme-${tileSetIndex}`;
    setGameTitle(
      tileSetIndex === 0 ? 'Radbro Match' : tileSetIndex === 1 ? 'Molady Match' : 'Kawamii Match'
    );
    setCurrentSounds(
      tileSetIndex === 0 ? sounds.default : tileSetIndex === 1 ? sounds.level2 : sounds.level3
    );
  }, [level]);

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
    if (timeLeft > 0 && movesLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowFailModal(true);
            setTimeout(() => {
              setShowFailModal(false);
              onGameOver();
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, movesLeft, onGameOver]);

  useEffect(() => {
    const initialGrid = createInitialGrid(tileSets[0]);
    setGrid(initialGrid);
  }, []);

  const clearAndRefill = async (currentGrid) => {
    let newGrid = currentGrid.map(row => row.map(tile => ({ ...tile })));
    let totalPoints = 0;
    let allMatchedPositions = [];

    const processMatches = () => {
      const { matches, powerUps: legacyPowerUps } = checkMatches(newGrid);
      if (matches.length === 0) return false;

      let matchedPositions = new Set();
      let powerUpCreations = [];
      let activationPoints = 0;

      matches.forEach((match) => {
        let positions = [];
        if (match.row !== undefined) {
          positions = match.cols.map(col => [match.row, col]);
        } else if (match.col !== undefined) {
          positions = match.rows.map(row => [row, match.col]);
        } else if (match.positions) {
          positions = match.positions;
        }

        if (match.powerUpTile) {
          positions = positions.filter(([r, c]) => r !== match.powerUpTile[0] || c !== match.powerUpTile[1]);
          powerUpCreations.push({ type: match.powerUpType, row: match.powerUpTile[0], col: match.powerUpTile[1] });
        }

        positions.forEach(pos => matchedPositions.add(pos.join(',')));
      });

      let baseMatchPoints = 0;
      const powerUpActivations = [];
      matchedPositions.forEach(pos => {
        const [row, col] = pos.split(',').map(Number);
        const tile = newGrid[row][col];
        if (tile) {
          baseMatchPoints += 10;
          if (tile.powerUp) {
            powerUpActivations.push({ type: tile.powerUp, row, col });
          }
        }
      });

      powerUpActivations.forEach(({ type, row, col }) => {
        let affectedTiles = [];
        if (type === 'striped-horizontal') {
          for (let c = 0; c < 6; c++) {
            affectedTiles.push([row, c]);
            setTileAnimations(prev => ({ ...prev, [`${row}-${c}`]: 'activate-striped' }));
          }
          activationPoints += affectedTiles.length * 30;
        } else if (type === 'striped-vertical') {
          for (let r = 0; r < 6; r++) {
            affectedTiles.push([r, col]);
            setTileAnimations(prev => ({ ...prev, [`${r}-${col}`]: 'activate-striped' }));
          }
          activationPoints += affectedTiles.length * 30;
        } else if (type === 'bomb') {
          for (let r = Math.max(0, row - 1); r <= Math.min(5, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(5, col + 1); c++) {
              affectedTiles.push([r, c]);
              setTileAnimations(prev => ({ ...prev, [`${r}-${c}`]: 'activate-bomb' }));
            }
          }
          activationPoints += affectedTiles.length * 50;
        }
        affectedTiles.forEach(pos => matchedPositions.add(pos.join(',')));
      });

      let creationPoints = 0;
      powerUpCreations.forEach(({ type, row, col }) => {
        if (type === 'striped-horizontal' || type === 'striped-vertical') {
          creationPoints += 100;
        } else if (type === 'bomb') {
          creationPoints += 200;
        }
        setTileAnimations(prev => ({ ...prev, [`${row}-${col}`]: 'create-power-up' }));
        setTimeout(() => {
          setTileAnimations(prev => {
            const newAnimations = { ...prev };
            delete newAnimations[`${row}-${col}`];
            return newAnimations;
          });
        }, 500);
      });

      const matchedArray = Array.from(matchedPositions).map(pos => pos.split(',').map(Number));
      matchedArray.forEach(([row, col]) => {
        newGrid[row][col] = null;
      });

      powerUpCreations.forEach(({ type, row, col }) => {
        if (newGrid[row][col]) {
          newGrid[row][col].powerUp = type;
        }
      });

      const points = baseMatchPoints + creationPoints + activationPoints;
      totalPoints += points;
      allMatchedPositions = [...allMatchedPositions, ...matchedArray];
      setMatchedTiles(matchedArray);
      if (isAudioUnlocked) currentSounds.match.play();

      if (matchedArray.length > 0) {
        const [row, col] = matchedArray[Math.floor(matchedArray.length / 2)];
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
      setTileAnimations({});

      let droppingPositions = [];
      const currentTileSet = tileSets[Math.floor((level - 1) / 3) % tileSets.length];
      for (let col = 0; col < 6; col++) {
        let column = newGrid.map((row) => row[col]).filter(Boolean);
        while (column.length < 6) {
          column.unshift({ image: currentTileSet[Math.floor(Math.random() * currentTileSet.length)] });
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
      const scoreGoal = difficulties[validDifficulty].scoreBase * level;
      if (newScore >= scoreGoal && movesLeft > 0 && timeLeft > 0) {
        setLevel((prevLevel) => {
          const newLevel = prevLevel + 1;
          const tileSetIndex = Math.floor((newLevel - 1) / 3) % tileSets.length;
          setMovesLeft(difficulties[validDifficulty].moves - Math.floor((newLevel - 1) / 3) * 2);
          setTimeLeft(difficulties[validDifficulty].time - Math.floor((newLevel - 1) / 3) * 5);
          setGrid(createInitialGrid(tileSets[tileSetIndex]));
          return newLevel;
        });
      }
      return newScore;
    });
    setGrid(newGrid);
  };

  const attemptSwap = (row, col) => {
    if (!selectedTile) return;
    const { row: prevRow, col: prevCol } = selectedTile;
    const isAdjacent =
      (Math.abs(prevRow - row) === 1 && prevCol === col) ||
      (Math.abs(prevCol - col) === 1 && prevRow === row);

    if (isAdjacent) {
      const direction = prevRow !== row ? 'vertical' : 'horizontal';
      setSwappingTiles([[prevRow, prevCol, direction], [row, col, direction]]);
      if (isAudioUnlocked) currentSounds.swap.play();

      setGrid((prevGrid) => {
        const tempGrid = prevGrid.map((row) => [...row]);
        [tempGrid[prevRow][prevCol], tempGrid[row][col]] = [tempGrid[row][col], tempGrid[prevRow][prevCol]];

        const { matches } = checkMatches(tempGrid);
        if (matches.length > 0) {
          setMovesLeft((prev) => {
            const newMoves = prev - 1;
            if (newMoves <= 0) {
              setShowFailModal(true);
              setTimeout(() => {
                setShowFailModal(false);
                onGameOver();
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
  };

  const handleTileClick = (row, col) => {
    selectedTile ? attemptSwap(row, col) : setSelectedTile({ row, col });
  };

  const handleTouchStart = (e, row, col) => {
    e.preventDefault();
    setSelectedTile({ row, col });
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, row, col });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (!touchStart || !selectedTile) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30;

    const { row, col } = touchStart;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && col < 5) attemptSwap(row, col + 1);
      else if (deltaX < 0 && col > 0) attemptSwap(row, col - 1);
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0 && row < 5) attemptSwap(row + 1, col);
      else if (deltaY < 0 && row > 0) attemptSwap(row - 1, col);
    }

    setSelectedTile(null);
    setTouchStart(null);
  };

  if (!grid) return <div>Loading...</div>;

  return (
    <div className="game-container">
      <h1 className="title">{gameTitle}</h1>
      <div className="high-score">High Score: {highScore}</div>
      <div className="score">Score: {score}</div>
      <div className="level">
        Level: {level} | Moves: {movesLeft} | Time: {timeLeft}s
      </div>
      {showFailModal && <div className="fail-modal">You Failed!</div>}
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
        tileAnimations={tileAnimations}
      />
    </div>
  );
}

export default Radmatch;