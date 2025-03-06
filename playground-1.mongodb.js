
show databases

use leaderboard
show databases
db.scores.find().sort({ score: -1 }).limit(10)