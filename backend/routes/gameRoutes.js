const express = require('express');
const router = express.Router();

router.post('/start', async (req, res) => {
    try {
        const gameId = "game_" + Date.now();
        res.status(201).json({ gameId });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start game' });
    }
}
);


module.exports = router;