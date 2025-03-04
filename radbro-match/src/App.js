import React, { useState } from 'react';
import './App.css';

// Tile component with 3D effect, NFT image, and touch support
const Tile = ({ image, onClick, isSelected, onTouchStart, onTouchMove, onTouchEnd }) => (
  <div
    className={`tile ${isSelected ? 'selected' : ''}`}
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

// Grid component
const Grid = ({ grid, handleTileClick, selectedTile, handleTouchStart, handleTouchMove, handleTouchEnd }) => (
  <div className="grid">
    {grid.map((row, rowIndex) =>
      row.map((image, colIndex) => (
        <Tile
          key={`${rowIndex}-${colIndex}`}
          image={image}
          onClick={() => handleTileClick(rowIndex, colIndex)}
          onTouchStart={e => handleTouchStart(e, rowIndex, colIndex)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          isSelected={
            selectedTile &&
            selectedTile.row === rowIndex &&
            selectedTile.col === colIndex
          }
        />
      ))
    )}
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

  const createInitialGrid = () => {
    const grid = [];
    for (let i = 0; i < 6; i++) {
      const row = [];
      for (let j = 0; j < 6; j++) {
        row.push(nftImages[Math.floor(Math.random() * nftImages.length)]);
      }
      grid.push(row);
    }
    return grid;
  };

  const [grid, setGrid] = useState(createInitialGrid());
  const [selectedTile, setSelectedTile] = useState(null);
  const [score, setScore] = useState(0);
  const [touchStart, setTouchStart] = useState(null); // Track touch start position

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

  const clearAndRefill = (grid, matches) => {
    let newGrid = grid.map(row => [...row]);
    let points = 0;

    matches.forEach(match => {
      if (match.row !== undefined) {
        match.cols.forEach(col => {
          newGrid[match.row][col] = null;
          points += 10;
        });
        if (match.cols.length === 4) points += 20;
        if (match.cols.length >= 5) points += 50;
      } else if (match.col !== undefined) {
        match.rows.forEach(row => {
          newGrid[row][match.col] = null;
          points += 10;
        });
        if (match.rows.length === 4) points += 20;
        if (match.rows.length >= 5) points += 50;
      }
    });
    setScore(prevScore => prevScore + points);

    for (let col = 0; col < 6; col++) {
      let column = [];
      for (let row = 5; row >= 0; row--) {
        column.push(newGrid[row][col]);
      }
      column = column.filter(tile => tile !== null);
      while (column.length < 6) {
        column.unshift(nftImages[Math.floor(Math.random() * nftImages.length)]);
      }
      for (let row = 5; row >= 0; row--) {
        newGrid[row][col] = column[5 - row];
      }
    }
    return newGrid;
  };

  const handleTileClick = (row, col) => {
    console.log('Clicked tile:', row, col);
    if (!selectedTile) {
      console.log('First tile selected:', row, col);
      setSelectedTile({ row, col });
    } else {
      attemptSwap(row, col);
    }
  };

  const handleTouchStart = (e, row, col) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, row, col });
    setSelectedTile({ row, col }); // Highlight tile on touch
    e.preventDefault(); // Prevent scrolling
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    // Optional: Add visual feedback during swipe (e.g., CSS transform)
  };

  const handleTouchEnd = (e) => {
    if (!touchStart || !selectedTile) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const threshold = 20; // Minimum swipe distance in pixels

    const { row, col } = touchStart;
    let targetRow = row;
    let targetCol = col;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      targetCol += deltaX > 0 ? 1 : -1; // Swipe right or left
    } else if (Math.abs(deltaY) > threshold) {
      targetRow += deltaY > 0 ? 1 : -1; // Swipe down or up
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
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        const temp = newGrid[prevRow][prevCol];
        newGrid[prevRow][prevCol] = newGrid[row][col];
        newGrid[row][col] = temp;

        let matches = checkMatches(newGrid);
        if (matches.length > 0) {
          console.log('Matches found:', matches);
          return clearAndRefill(newGrid, matches);
        }
        return newGrid;
      });
    }
    setSelectedTile(null);
  };

  return (
    <div className="App">
      <h1>Radbro Match</h1>
      <div className="score">Score: {score}</div>
      <Grid
        grid={grid}
        handleTileClick={handleTileClick}
        selectedTile={selectedTile}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />
    </div>
  );
}

export default App;