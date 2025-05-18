const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/start', gameController.startGame);
router.post('/move', gameController.playMove);
router.post('/valid-moves', gameController.getValidMoves);


module.exports = router;