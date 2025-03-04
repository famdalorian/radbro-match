import React, { useState } from 'react';
import './App.css';

// Tile component with 3D effect and NFT image
const Tile = ({ image, onClick, isSelected }) => (
  <div
    className={`tile ${isSelected ? 'selected' : ''}`}
    onClick={onClick}
  >
    <div className="tile-inner">
      <img src={image} alt="NFT Tile" className="nft-image" />
    </div>
  </div>
);

// Grid component
const Grid = ({ grid, handleTileClick, selectedTile }) => (
  <div className="grid">
    {grid.map((row, rowIndex) =>
      row.map((image, colIndex) => (
        <Tile
          key={`${rowIndex}-${colIndex}`}
          image={image}
          onClick={() => handleTileClick(rowIndex, colIndex)}
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
  // Replace these with your NFT image URLs
  const nftImages = [
    'https://example.com/nft1.png',
    'https://example.com/nft2.png',
    'https://example.com/nft3.png',
    'https://example.com/nft4.png',
    'https://example.com/nft5.png',
  ];

  // Initialize 6x6 grid with random NFT images
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

  const handleTileClick = (row, col) => {
    console.log('Clicked tile:', row, col);
    if (!selectedTile) {
      console.log('First tile selected:', row, col);
      setSelectedTile({ row, col });
    } else {
      const { row: prevRow, col: prevCol } = selectedTile;
      const isAdjacent =
        (Math.abs(prevRow - row) === 1 && prevCol === col) ||
        (Math.abs(prevCol - col) === 1 && prevRow === row);
      console.log('Second tile clicked:', row, col, 'Adjacent?', isAdjacent);

      if (isAdjacent) {
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row => [...row]);
          const temp = newGrid[prevRow][prevCol];
          newGrid[prevRow][prevCol] = newGrid[row][col];
          newGrid[row][col] = temp;
          console.log('New grid after swap:', newGrid);
          return newGrid;
        });
      }
      setSelectedTile(null);
    }
  };

  return (
    <div className="App">
      <h1>Radbro Match</h1>
      <Grid grid={grid} handleTileClick={handleTileClick} selectedTile={selectedTile} />
    </div>
  );
}

export default App;