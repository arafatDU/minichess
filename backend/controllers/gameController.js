const {
    createGame,
    getBestMove,
    isCheck,
    generateMoves,
    cloneGame,
    evaluateBoard // Add this if you use evaluateBoard here
} = require('../minichess/gameLogic');

const gameController = {
    startGame: (req, res) => {
        try {
            const { gameMode = 'human' } = req.body;
            if (!['human', 'ai', 'ai-vs-ai'].includes(gameMode)) {
                return res.status(400).json({ error: 'Invalid game mode' });
            }

            const game = createGame();
            const response = { 
                board: game.board,
                turn: game.turn,
                gameMode: gameMode,
                message: "Game started! White's turn.",
                status: 'game_started' 
            };

            // If the game mode is AI vs AI, make the first AI move automatically
            if (gameMode === 'ai-vs-ai') {
                const { bestMove, evaluation } = getBestMove(game); // Extract bestMove and evaluation
                if (bestMove) {
                    const moveResult = game.makeMove(bestMove);
                    response.board = game.board;
                    response.turn = game.turn;
                    response.lastMove = bestMove;
                    response.message = moveResult.message;
                    response.evaluation = evaluation; // Include evaluation if needed
                }
            }

            res.status(200).json(response);
        } catch (error) {
            console.error('Error starting game:', error);
            res.status(500).json({ error: 'Failed to start game' });
        }
    },

    playMove: async (req, res) => {
        try {
            const { board, move, turn, gameMode = 'human' } = req.body;

            console.log('Received move:', move);

            // Validate input fields
            if (!board || !move || !turn) {
                return res.status(400).json({ 
                    error: 'Missing required fields. Need board, move, and turn.' 
                });
            }

            // Validate move structure
            if (!move.from || !move.to || 
                !Array.isArray(move.from) || !Array.isArray(move.to) ||
                move.from.length !== 2 || move.to.length !== 2) {
                return res.status(400).json({ 
                    error: 'Invalid move format. Expected {from: [x, y], to: [x, y], promotion?: "q|r|b|n"}' 
                });
            }

            // Set up game state
            const game = createGame();
            game.board = board;
            game.turn = turn;

            try {
                // Attempt to make the move and get the result, including any captured piece
                const moveResult = game.makeMove(move);
                const capturedPiece = moveResult.captured ? moveResult.captured : null; // Track captured piece if available
                
                const response = {
                    board: game.board,
                    turn: game.turn,
                    lastMove: move,
                    isGameOver: moveResult.isOver,
                    message: moveResult.message,
                    gameStatus: moveResult,
                    capturedPiece, // Include captured piece in response
                };

                // If game over, respond with the current status
                if (moveResult.isOver) {
                    return res.status(200).json(response);
                }

                // For Human vs AI, make AI's move if it's the AI's turn
                if (gameMode === 'ai' && game.turn === 'b') {
                    const {bestMove, evaluation} = getBestMove(game); 
                    // const aiMove = getBestMove(game);
                    if (bestMove) {
                        const aiMoveResult = game.makeMove(bestMove);
                        response.board = game.board;
                        response.turn = game.turn;
                        response.lastMove = bestMove;
                        response.isGameOver = aiMoveResult.isOver;
                        response.message = aiMoveResult.message;
                        response.gameStatus = aiMoveResult;
                        response.evaluation = evaluation;
                        if (aiMoveResult.captured) {
                            response.capturedPiece = aiMoveResult.captured;
                        }
                    }
                }
                // For AI vs AI, make both moves automatically
                else if (gameMode === 'ai-vs-ai') {
                    const { bestMove, evaluation } = getBestMove(game);
                    if (bestMove) {
                        const aiMoveResult = game.makeMove(bestMove);
                        response.board = game.board;
                        response.turn = game.turn;
                        response.lastMove = bestMove;
                        response.isGameOver = aiMoveResult.isOver;
                        response.message = aiMoveResult.message;
                        response.gameStatus = aiMoveResult;
                        response.evaluation = evaluation;
                        if (aiMoveResult.captured) {
                            response.capturedPiece = aiMoveResult.captured;
                        }
                    }
                    
                }

                return res.status(200).json(response);

            } catch (moveError) {
                // Handle promotion requirement by returning additional details
                if (moveError.message.includes('Promotion required')) {
                    return res.status(400).json({ 
                        error: moveError.message,
                        requiresPromotion: true,
                        validPromotions: ['q', 'r', 'b', 'n'],
                        move: move
                    });
                }

                return res.status(400).json({ 
                    error: moveError.message || 'Invalid move'
                });
            }

        } catch (error) {
            console.error('Error processing move:', error);
            res.status(500).json({ 
                error: 'Internal server error while processing move'
            });
        }
    },

    getValidMoves: (req, res) => {
        try {
            const { board, position, turn } = req.body;
            
            // Validate input fields
            if (!board || !position || !turn) {
                return res.status(400).json({ 
                    error: 'Missing required fields' 
                });
            }

            // Validate position format
            if (!Array.isArray(position) || position.length !== 2) {
                return res.status(400).json({ 
                    error: 'Invalid position format' 
                });
            }

            // Set up game state
            const game = createGame();
            game.board = board;
            game.turn = turn;
            
            const [x, y] = position;
            const piece = game.board[x][y];

            // Check if the selected piece belongs to the player
            const isValidPiece = piece !== '.' && (
                (turn === 'w' && piece === piece.toUpperCase()) ||
                (turn === 'b' && piece === piece.toLowerCase())
            );

            // Return error if selected piece is invalid
            if (!isValidPiece) {
                return res.status(400).json({
                    error: `Invalid piece selection. It is ${turn === 'w' ? 'White' : 'Black'}'s turn.`,
                    validMoves: []
                });
            }

            // Generate valid moves for the selected piece
            const validMoves = game.getValidMoves(position);
            
            res.status(200).json({
                validMoves,
                message: validMoves.length === 0 ? 
                    'No valid moves available' : 
                    `Found ${validMoves.length} valid moves`
            });

        } catch (error) {
            console.error('Error getting valid moves:', error);
            res.status(400).json({ error: error.message });
        }
    },



};


module.exports = gameController;