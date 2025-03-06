const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://hunytrip:48pkxCN0VxIxOSv0@radmatch.nvmaj.mongodb.net/leaderboard?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Score Model
const ScoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', ScoreSchema);

// Add a root route (optional)
app.get('/', (req, res) => {
  res.send('Backend is running! Use /api/leaderboard or /api/scores for API endpoints.');
});

// Routes
app.post('/api/scores', async (req, res) => {
  const { name, score } = req.body;
  console.log('Received data:', { name, score });
  try {
    const newScore = new Score({ name, score });
    await newScore.save();
    console.log('Saved score:', newScore);
    res.status(201).json(newScore);
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.get('/api/scores', async (req, res) => {
  try {
    const scores = await Score.find();
    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 }).limit(10);
    res.json(scores);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));