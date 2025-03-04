import React, { useState, useEffect } from 'react';
import './App.css';

// Tile component
const Tile = ({ image, onClick, isSelected, onTouchStart, onTouchMove, onTouchEnd, isMatched, isDropping, isSwapping, swapDirection }) => (
  <div
    className={`tile ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${isDropping ? 'dropping' : ''} ${isSwapping ? `swapping-${swapDirection}` : ''}`}
    onClick={onClick}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
  >
    <div className="tile-inner">
      {image ? <img src={image} alt="NFT Tile" className="nft-image" /> : null}
    </div>
  </div>
);

// Score Pop-Up component
const ScorePopup = ({ points, x, y }) => (
  <div className="score-popup" style={{ left: x, top: y }}>
    +{points}
  </div>
);

// Grid component
const Grid = ({ grid, handleTileClick, selectedTile, handleTouchStart, handleTouchMove, handleTouchEnd, matchedTiles, droppingTiles, scorePopups, swappingTiles }) => (
  <div className="grid">
    {grid.map((row, rowIndex) =>
      row.map((image, colIndex) => {
        const swapInfo = swappingTiles.find(([r, c]) => r === rowIndex && c === colIndex);
        return (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            image={image}
            onClick={() => handleTileClick(rowIndex, colIndex)}
            onTouchStart={e => handleTouchStart(e, rowIndex, colIndex)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            isSelected={selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex}
            isMatched={matchedTiles.some(([r, c]) => r === rowIndex && c === colIndex)}
            isDropping={droppingTiles.some(([r, c]) => r === rowIndex && c === colIndex)}
            isSwapping={!!swapInfo}
            swapDirection={swapInfo ? swapInfo[2] : null}
          />
        );
      })
    )}
    {scorePopups.map((popup, index) => (
      <ScorePopup key={index} points={popup.points} x={popup.x} y={popup.y} />
    ))}
  </div>
);

function App() {
  const nftImages = [
    'https://i.seadn.io/s/raw/files/1b3db129c621b308b6ca77c761010562.png?auto=format&dpr=1&w=2048',
    'https://i.seadn.io/s/raw/files/46c0bdbfc4e1fdc800e161597e9f870a.png?auto=format&dpr=1&w=2048',
    'https://i.seadn.io/s/raw/files/863a51981595de21bdc6933a55a63c32.png?auto=format&dpr=1&w=3840',
    'https://i.seadn.io/s/raw/files/d44b1c722776727e95ed3b2f202fdf87.png?auto=format&dpr=1&w=3840',
    'https://i.seadn.io/s/raw/files/d41e3e71bc13c91b67bb3e822c4a8bb9.png?auto=format&dpr=1&w=3840',
  ];

  const swapSound = new Audio('/Sounds/swoosh.mp3');
  const matchSound = new Audio('/Sounds/match.mp3');
  const dropSound = new Audio('/Sounds/plop.mp3');

  const checkMatches = (grid) => {
    let matches = [];
    for (let i = 0; i < 6; i++) {
      let count = 1;
      let startCol = 0;
      for (let j = 1; j < 6; j++) {
        if (grid[i][j] && grid[i][j] === grid[i][j - 1]) {
          count++;
        } else {
          if (count >= 3) {
            matches.push({
              row: i,
              cols: Array.from({ length: count }, (_, k) => startCol + k),
            });
          }
          count = 1;
          startCol = j;
        }
      }
      if (count >= 3) {
        matches.push({
          row: i,
          cols: Array.from({ length: count }, (_, k) => startCol + k),
        });
      }
    }
    for (let j = 0; j < 6; j++) {
      let count = 1;
      let startRow = 0;
      for (let i = 1; i < 6; i++) {
        if (grid[i][j] && grid[i][j] === grid[i - 1][j]) {
          count++;
        } else {
          if (count >= 3) {
            matches.push({
              col: j,
              rows: Array.from({ length: count }, (_, k) => startRow + k),
            });
          }
          count = 1;
          startRow = i;
        }
      }
      if (count >= 3) {
        matches.push({
          col: j,
          rows: Array.from({ length: count }, (_, k) => startRow + k),
        });
      }
    }
    return matches;
  };

  const createInitialGrid = () => {
    let grid = [];
    // Initial random fill
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 6; j++) {
        row.push(nftImages[Math.floor(Math.random() * nftImages.length)]);
      }
      grid.push(row);
    }

    // Check and resolve matches
    let matches = checkMatches(grid);
    while (matches.length > 0) {
      matches.forEach(match => {
        if (match.row !== undefined) {
          // Shuffle one tile in the horizontal match
          const randomCol = match.cols[Math.floor(Math.random() * match.cols.length)];
          grid[match.row][randomCol] = nftImages[Math.floor(Math.random() * nftImages.length)];
        } else if (match.col !== undefined) {
          // Shuffle one tile in the vertical match
          const randomRow = match.rows[Math.floor(Math.random() * match.rows.length)];
          grid[randomRow][match.col] = nftImages[Math.floor(Math.random() * nftImages.length)];
        }
      });
      matches = checkMatches(grid); // Recheck until no matches
    }
    return grid;
  };

  const [grid, setGrid] = useState(createInitialGrid());
  const [selectedTile, setSelectedTile] = useState(null);
  const [score, setScore] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [matchedTiles, setMatchedTiles] = useState([]);
  const [droppingTiles, setDroppingTiles] = useState([]);
  const [scorePopups, setScorePopups] = useState([]);
  const [swappingTiles, setSwappingTiles] = useState([]);

  const clearAndRefill = (grid, matches) => {
    let newGrid = grid.map(row => [...row]);
    let points = 0;
    let matchedPositions = [];

    matches.forEach(match => {
      if (match.row !== undefined) {
        match.cols.forEach(col => {
          matchedPositions.push([match.row, col]);
          newGrid[match.row][col] = null;
          points += 10;
        });
        if (match.cols.length === 4) points += 20;
        if (match.cols.length >= 5) points += 50;
      } else if (match.col !== undefined) {
        match.rows.forEach(row => {
          matchedPositions.push([row, match.col]);
          newGrid[row][match.col] = null;
          points += 10;
        });
        if (match.rows.length === 4) points += 20;
        if (match.rows.length >= 5) points += 50;
      }
    });
    setScore(prevScore => prevScore + points);
    setMatchedTiles(matchedPositions);
    matchSound.play();

    if (matchedPositions.length > 0) {
      const [row, col] = matchedPositions[Math.floor(matchedPositions.length / 2)];
      const x = col * 84 + 42;
      const y = row * 84 + 42;
      setScorePopups(prev => [...prev, { points, x, y }]);
      setTimeout(() => setScorePopups(prev => prev.slice(1)), 1000);
    }

    setTimeout(() => {
      let droppingPositions = [];
      for (let col = 0; col < 6; col++) {
        let column = [];
        for (let row = 5; row >= 0; row--) {
          column.push(newGrid[row][col]);
        }
        column = column.filter(tile => tile !== null);
        while (column.length < 6) {
          column.unshift(nftImages[Math.floor(Math.random() * nftImages.length)]);
          droppingPositions.push([6 - column.length, col]);
        }
        for (let row = 5; row >= 0; row--) {
          newGrid[row][col] = column[5 - row];
        }
      }
      setGrid(newGrid);
      setMatchedTiles([]);
      setDroppingTiles(droppingPositions);
      dropSound.play();
      setTimeout(() => setDroppingTiles([]), 600);
    }, 400);
  };

  const handleTileClick = (row, col) => {
    console.log('Clicked tile:', row, col);
    if (!selectedTile) {
      setSelectedTile({ row, col });
    } else {
      attemptSwap(row, col);
    }
  };

  const handleTouchStart = (e, row, col) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, row, col });
    setSelectedTile({ row, col });
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !selectedTile) return;
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
    }

    setTouchStart(null);
    setSelectedTile(null);
  };

  const attemptSwap = (row, col) => {
    const { row: prevRow, col: prevCol } = selectedTile;
    const isAdjacent =
      (Math.abs(prevRow - row) === 1 && prevCol === col) ||
      (Math.abs(prevCol - col) === 1 && prevRow === row);
    console.log('Attempting swap to:', row, col, 'Adjacent?', isAdjacent);

    if (isAdjacent) {
      swapSound.play();
      const direction = prevRow !== row ? 'vertical' : 'horizontal';
      setSwappingTiles([[prevRow, prevCol, direction], [row, col, direction]]);
      setTimeout(() => setSwappingTiles([]), 300);
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        const temp = newGrid[prevRow][prevCol];
        newGrid[prevRow][prevCol] = newGrid[row][col];
        newGrid[row][col] = temp;

        let matches = checkMatches(newGrid);
        if (matches.length > 0) {
          clearAndRefill(newGrid, matches);
        }
        return newGrid;
      });
    }
    setSelectedTile(null);
  };

  return (
    <div className="App">
      <h1 className="title">Radbro Match</h1>
      <div className="score">Score: {score}</div>
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