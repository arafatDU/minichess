

// const { evaluateBoard } = require('../utils/evaluation');

const transpositionTable = {
    table: new Map(),
    maxSize: 500000,
    generateHash: (board, turn) => JSON.stringify(board) + turn,
    store: function (board, turn, depth, value, flag, bestMove) {
        const hash = this.generateHash(board, turn);
        this.table.set(hash, { depth, value, flag, bestMove });
        if (this.table.size > this.maxSize) {
            const firstKey = this.table.keys().next().value;
            this.table.delete(firstKey);
        }
    },
    lookup: function (board, turn) {
        const hash = this.generateHash(board, turn);
        return this.table.get(hash);
    },
    clear: function () {
        this.table.clear();
    }
};

function evaluateBoard  (game)  {
    let score = 0;
    const board = game.board;

    const pieceValues = {
        'p': 1,
        'n': 3,
        'b': 3.3,
        'r': 5,
        'q': 9,
        'k': 0
    };

    const positionBonuses = {
        'p': [
            [0, 0, 0, 0, 0],
            [0.5, 0.5, 0.5, 0.5, 0.5],
            [0.2, 0.2, 0.3, 0.2, 0.2],
            [0.1, 0.1, 0.2, 0.1, 0.1],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        'n': [
            [0, 0.1, 0.2, 0.1, 0],
            [0.1, 0.2, 0.4, 0.2, 0.1],
            [0.2, 0.3, 0.5, 0.3, 0.2],
            [0.2, 0.3, 0.5, 0.3, 0.2],
            [0.1, 0.2, 0.4, 0.2, 0.1],
            [0, 0.1, 0.2, 0.1, 0]
        ],
        'b': [
            [0, 0.1, 0.2, 0.1, 0],
            [0.1, 0.2, 0.3, 0.2, 0.1],
            [0.1, 0.3, 0.4, 0.3, 0.1],
            [0.1, 0.3, 0.4, 0.3, 0.1],
            [0.1, 0.2, 0.3, 0.2, 0.1],
            [0, 0.1, 0.2, 0.1, 0]
        ],
        'r': [
            [0.2, 0.3, 0.3, 0.3, 0.2],
            [0.3, 0.4, 0.4, 0.4, 0.3],
            [0.1, 0.2, 0.2, 0.2, 0.1],
            [0.1, 0.2, 0.2, 0.2, 0.1],
            [0.1, 0.2, 0.2, 0.2, 0.1],
            [0, 0, 0, 0, 0]
        ],
        'q': [
            [0.2, 0.3, 0.3, 0.3, 0.2],
            [0.3, 0.4, 0.4, 0.4, 0.3],
            [0.2, 0.3, 0.3, 0.3, 0.2],
            [0.2, 0.3, 0.3, 0.3, 0.2],
            [0.1, 0.2, 0.2, 0.2, 0.1],
            [0, 0.1, 0.2, 0.1, 0]
        ],
        'k': [
            [-0.3, -0.4, -0.4, -0.4, -0.3],
            [-0.4, -0.5, -0.5, -0.5, -0.4],
            [-0.4, -0.5, -0.5, -0.5, -0.4],
            [-0.4, -0.5, -0.5, -0.5, -0.4],
            [-0.3, -0.4, -0.4, -0.4, -0.3],
            [0, 0, 0, 0, 0]
        ]
    };

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const piece = board[i][j];
            if (piece && piece !== '.') {
                const pieceType = piece.toLowerCase();
                let value = pieceValues[pieceType];

                if (positionBonuses[pieceType]) {
                    const posValue = positionBonuses[pieceType][i][j];
                    value += posValue;
                }
                 if (pieceType === 'k') {
                    const isKingExposed = (i === 0 || i === 5) && (j === 0 || j === 4); 
                    if (isKingExposed) value -= 2; 
                }

                if (pieceType === 'p') {
                    const isIsolated = !board[i - 1]?.[j]?.toLowerCase() === 'p' && !board[i + 1]?.[j]?.toLowerCase() === 'p';
                    const isDoubled = i > 0 && board[i - 1][j]?.toLowerCase() === 'p';
                    if (isIsolated) value -= 0.3;
                    if (isDoubled) value -= 0.5;
                }

                score += piece === piece.toUpperCase() ? value : -value;
            }
        }
    }

    // Count available moves for each side
    const whiteMoves = generateMoves(game, 'w').length;
    const blackMoves = generateMoves(game, 'b').length;
    score += (whiteMoves - blackMoves) * 0.1; // Encourage mobility
    return score;
};

function cloneGame(game) {
    const newGame = createGame();
    newGame.board = JSON.parse(JSON.stringify(game.board));
    newGame.turn = game.turn;
    newGame.moveHistory = [...game.moveHistory];
    newGame.winner = game.winner;
    newGame.gameStatus = game.gameStatus;
    return newGame;
}

function isValidPosition(x, y) {
    return x >= 0 && x < 6 && y >= 0 && y < 5;
}

function getKingPosition(game, color) {
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const piece = game.board[i][j];
            if ((color === 'w' && piece === 'K') ||
                (color === 'b' && piece === 'k')) {
                return [i, j];
            }
        }
    }
    return null;
}

function isCheck(game, color) {
    const kingPos = getKingPosition(game, color);
    if (!kingPos) return false;

    const gameCopy = cloneGame(game);
    gameCopy.turn = color === 'w' ? 'b' : 'w';
    const opponentMoves = generateMoves(gameCopy);

    return opponentMoves.some(move =>
        move.to[0] === kingPos[0] && move.to[1] === kingPos[1]
    );
}

function quiescenceSearch(game, alpha, beta, depth, maxDepth = 4) {
    if (depth >= maxDepth) return evaluateBoard(game);

    const standPat = evaluateBoard(game);

    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = generateMoves(game).filter(move => {
        const [toX, toY] = move.to;
        return game.board[toX][toY] !== '.';
    });

    for (const move of moves) {
        const gameCopy = cloneGame(game);
        try {
            gameCopy.makeMove(move);
            const score = -quiescenceSearch(gameCopy, -beta, -alpha, depth + 1, maxDepth);
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        } catch {
            continue;
        }
    }
    return alpha;
}












function isCheckmate(game, color) {
    console.log(`\nChecking checkmate for ${color}`);

    if (!isCheck(game, color)) {
        console.log(`${color} king is not in check`);
        return false;
    }

    console.log(`${color} king IS in check - checking for escape moves`);


    const allMoves = generateMoves(game, color);
    console.log(`Found ${allMoves.length} possible moves to try escape check`);

    for (const move of allMoves) {
        const gameCopy = cloneGame(game);
        try {
            gameCopy.turn = color;
            gameCopy.makeMove(move);
            if (!isCheck(gameCopy, color)) {
                console.log(`Not in checkmate - found escape move:`, move);
                return false; // Found a move that escapes check
            }
            console.log(`Move ${JSON.stringify(move)} doesn't escape check`);
        } catch (error) {
            continue;
        }
    }
    console.log(`CHECKMATE CONFIRMED - ${color} has no legal moves to escape check`);

    return true;
}

function isStalemate(game, color) {
    if (isCheck(game, color)) return false;
    const moves = generateMoves(game, color);
    return moves.length === 0;
}

function isInsufficientMaterial(game) {
    const pieces = game.board.flat().filter(piece => piece !== '.');

    if (pieces.length <= 2) return true; // Only kings left

    if (pieces.length === 3) {
        const nonKings = pieces.filter(p => p.toLowerCase() !== 'k');
        if (nonKings.length === 1) {
            const piece = nonKings[0].toLowerCase();
            return piece === 'n' || piece === 'b';
        }
    }

    return false;
}

function createGame () {
    return {
        board: [
            ['r', 'n', 'b', 'q', 'k'],
            ['p', 'p', 'p', 'p', 'p'],
            ['.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.'],
            ['P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K']
        ],
        turn: 'w',
        moveHistory: [],
        winner: null,
        gameStatus: null,
        makeMove(move) {
            console.log('\nAttempting to make move:', move);
            const { from, to, promotion } = move;

            if (!Array.isArray(from) || !Array.isArray(to) ||
                from.length !== 2 || to.length !== 2) {
                throw new Error('Invalid move format');
            }

            const [fromX, fromY] = from;
            const [toX, toY] = to;

            if (!isValidPosition(fromX, fromY) || !isValidPosition(toX, toY)) {
                throw new Error('Move out of bounds');
            }

            const piece = this.board[fromX][fromY];
            const captured = this.board[toX][toY] !== '.' ? this.board[toX][toY] : null; // Capture piece if exists
            if (piece === '.') {
                throw new Error('No piece at selected position');
            }

            if ((this.turn === 'w' && piece !== piece.toUpperCase()) ||
                (this.turn === 'b' && piece !== piece.toLowerCase())) {
                throw new Error('Not your turn');
            }

            const validMoves = generatePieceMoves(this, [fromX, fromY]);
            const isValidMove = validMoves.some(m =>
                m.to[0] === toX && m.to[1] === toY
            );

            if (!isValidMove) {
                console.log('Move not found in valid moves list');
                throw new Error('Invalid move for this piece');
            }

            const originalPiece = this.board[toX][toY];
            console.log(`Moving ${piece} from [${fromX},${fromY}] to [${toX},${toY}]`);
            this.board[toX][toY] = piece;
            this.board[fromX][fromY] = '.';

            // Handle pawn promotion
            const isPawn = piece.toLowerCase() === 'p';
            const promotionRow = this.turn === 'w' ? 0 : 5;

            if (isPawn && toX === promotionRow) {
                console.log('Pawn reached promotion row');
                // Automatically promote to queen
                this.board[toX][toY] = this.turn === 'w' ? 'Q' : 'q';
                console.log(`Pawn promoted to ${this.board[toX][toY]}`);
            } else {
                this.board[toX][toY] = piece;
            }

            // Check if move leaves/puts own king in check
            if (isCheck(this, this.turn)) {
                console.log(`Move would leave/keep king in check - reverting move`);
                this.board[fromX][fromY] = piece;
                this.board[toX][toY] = originalPiece;
                throw new Error('Move would leave king in check');
            }

            // Record move in history
            this.moveHistory.push({
                from: move.from,
                to: move.to,
                piece: piece,
                captured: originalPiece !== '.',
                promotion: isPawn && toX === promotionRow ? 'q' : null

            });

            const oldTurn = this.turn;
            this.turn = this.turn === 'w' ? 'b' : 'w';
            console.log(`Turn switched to ${this.turn}`);


            if (isCheck(this, this.turn)) {
                console.log(`${this.turn} is in check after move`);

                const allPossibleMoves = generateMoves(this, this.turn);
                console.log(`Found ${allPossibleMoves.length} possible moves to escape check`);

                let canEscapeCheck = false;

                // Try each move in the cloned game
                for (const possibleMove of allPossibleMoves) {
                    const gameCopy = cloneGame(this);
                    gameCopy.turn = this.turn; // Ensure correct turn in copy

                    try {
                        const [fx, fy] = possibleMove.from;
                        const [tx, ty] = possibleMove.to;
                        const movingPiece = gameCopy.board[fx][fy];
                        gameCopy.board[fx][fy] = '.';
                        gameCopy.board[tx][ty] = movingPiece;

                        // If this position is not in check, we found an escape
                        if (!isCheck(gameCopy, this.turn)) {
                            canEscapeCheck = true;
                            console.log('Found escape move:', possibleMove);
                            break;
                        }

                        // Revert the move in copy
                        gameCopy.board[fx][fy] = movingPiece;
                        gameCopy.board[tx][ty] = '.';
                    } catch (error) {
                        continue;
                    }
                }

                if (!canEscapeCheck) {
                    console.log('CHECKMATE CONFIRMED - no valid moves to escape check');
                    return {
                        isOver: true,
                        result: 'checkmate',
                        winner: oldTurn,
                        message: `Checkmate! ${oldTurn === 'w' ? 'White' : 'Black'} wins!`
                    };
                }

                return {
                    isOver: false,
                    result: null,
                    winner: null,
                    message: `${this.turn === 'w' ? 'White' : 'Black'} is in check!`
                };
            }

            // Check for stalemate
            const availableMoves = generateMoves(this, this.turn);
            if (availableMoves.length === 0) {
                console.log('STALEMATE DETECTED');
                return {
                    isOver: true,
                    result: 'stalemate',
                    winner: 'draw',
                    message: 'Game drawn by stalemate!'
                };
            }

            // Check for insufficient material
            if (isInsufficientMaterial(this)) {
                console.log('INSUFFICIENT MATERIAL DETECTED');
                return {
                    isOver: true,
                    result: 'insufficient',
                    winner: 'draw',
                    message: 'Game drawn by insufficient material!'
                };
            }

            // Return normal game status
            return {
                isOver: false,
                result: null,
                winner: null,
                captured: captured,
                message: `${this.turn === 'w' ? 'White' : 'Black'} to move`
            };
        },
        makeAIMove() {
            const move = getBestMove(this);
            if (move) {
                return this.makeMove(move);
            }
            return null;
        },

        getGameStatus() {
            const opponent = this.turn;
            const current = opponent === 'w' ? 'b' : 'w';
            console.log(`Checking game status: Turn = ${this.turn}, Opponent = ${opponent}`);

            if (isCheckmate(this, opponent)) {
                console.log(`Game over - Checkmate! ${current} wins`);

                return {
                    isOver: true,
                    result: 'checkmate',
                    winner: current,
                    message: `Checkmate! ${current === 'w' ? 'White' : 'Black'} wins!`
                };
            }

            if (isStalemate(this, opponent)) {
                return {
                    isOver: true,
                    result: 'stalemate',
                    winner: 'draw',
                    message: 'Game drawn by stalemate!'
                };
            }

            if (isInsufficientMaterial(this)) {
                return {
                    isOver: true,
                    result: 'insufficient',
                    winner: 'draw',
                    message: 'Game drawn by insufficient material!'
                };
            }

            // Check if current player is in check
            if (isCheck(this, opponent)) {
                return {
                    isOver: false,
                    result: null,
                    winner: null,
                    message: `${opponent === 'w' ? 'White' : 'Black'} is in check!`
                };
            }

            return {
                isOver: false,
                result: null,
                winner: null,
                message: `${opponent === 'w' ? 'White' : 'Black'} to move`
            };
        },

        isGameOver() {
            const status = this.getGameStatus();
            return status.isOver;
        },

        getValidMoves(position) {
            const moves = generatePieceMoves(this, position);
            return moves.filter(move => {
                const gameCopy = cloneGame(this);
                try {
                    gameCopy.makeMove(move);
                    return !isCheck(gameCopy, this.turn);
                } catch {
                    return false;
                }
            });
        }
    };
};



/**
 * Processes a move based on the current board state and the move object.
 * @param {Array} boardState - The current board state as a 6x5 array.
 * @param {Object} move - The move to execute.
 * @returns {Object} - The updated board state and game status.
 */
function makeMove  (boardState, move) {
    try {
        console.log('Making move with board state:', boardState, 'and move:', move);
        if (!Array.isArray(boardState) || boardState.length !== 6 || !Array.isArray(boardState[0]) || boardState[0].length !== 5) {
            throw new Error('Invalid board state format. Ensure it is a 6x5 array.');
        }
        const game = exports.createGame();
        game.board = boardState;
        // Determine whose turn it is based on move history or external input
        // For simplicity, assuming 'w' to move. Adjust as necessary.
        game.turn = 'w'; // You might need to pass the current turn as part of the board state or separately
        const status = game.makeMove(move);
        const isGameOver = game.isGameOver();
        return { board: game.board, isGameOver, status };
    } catch (error) {
        throw new Error(`Error processing move: ${error.message}`);
    }
};


function runMinimax (game, depth, alpha = -Infinity, beta = Infinity, maximizingPlayer = true)  {
    console.log(`Running minimax at depth ${depth} for ${maximizingPlayer ? 'maximizing' : 'minimizing'} player.`);
    if (depth <= 0 || game.isGameOver()) {
        return { score: evaluatePosition(game) };
    }
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        let bestMove = null;
        const moves = generateMoves(game, game.turn);
        for (const move of moves) {
            const gameCopy = cloneGame(game);
            try {
                gameCopy.makeMove(move);
                const evaluation = exports.runMinimax(gameCopy, depth - 1, alpha, beta, false).score;
                if (evaluation > maxEval) {
                    maxEval = evaluation;
                    bestMove = move;
                }
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            } catch (err) {
                console.error('Error during minimax move generation:', err);
            }
        }
        return { score: maxEval, bestMove };
    } else {
        let minEval = Infinity;
        let bestMove = null;
        const moves = generateMoves(game, game.turn);
        for (const move of moves) {
            const gameCopy = cloneGame(game);
            try {
                gameCopy.makeMove(move);
                const evaluation = exports.runMinimax(gameCopy, depth - 1, alpha, beta, true).score;
                if (evaluation < minEval) {
                    minEval = evaluation;
                    bestMove = move;
                }
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            } catch (err) {
                console.error('Error during minimax move generation:', err);
            }
        }
        return { score: minEval, bestMove };
    }
};

/**
 * Evaluates the current board position.
 * @param {Object} game - The current game instance.
 * @returns {number} - The evaluation score.
 */
function evaluatePosition(game) {
    let score = evaluateBoard(game);

    // Analyze move history for patterns
    if (game.moveHistory.length > 0) {
        const lastMove = game.moveHistory[game.moveHistory.length - 1];
        const piece = game.board[lastMove.to[0]][lastMove.to[1]];

        // Check last 8 moves for patterns
        const recentMoves = game.moveHistory.slice(-8);
        const pieceMoveCounts = {};
        const positionCounts = {};

        recentMoves.forEach(move => {
            const piece = game.board[move.to[0]][move.to[1]];
            pieceMoveCounts[piece] = (pieceMoveCounts[piece] || 0) + 1;

            const posKey = `${move.from[0]},${move.from[1]}-${move.to[0]},${move.to[1]}`;
            positionCounts[posKey] = (positionCounts[posKey] || 0) + 1;
        });

        // Penalize piece overuse
        Object.values(pieceMoveCounts).forEach(count => {
            if (count > 2) {  // If piece used more than twice in last 8 moves
                score -= (count - 2) * 75;
            }
        });

        // Penalize position repetition
        Object.values(positionCounts).forEach(count => {
            if (count > 1) {  // If position repeated
                score -= (count - 1) * 100;
            }
        });

        // Encourage piece development
        const unusedPieces = getAllPieces(game).filter(p =>
            !recentMoves.some(m =>
                m.from[0] === p.row && m.from[1] === p.col
            )
        );
        score -= unusedPieces.length * 20;  // Small penalty for unused pieces
    }

    // Add checkmate/stalemate evaluation
    if (game.gameStatus && game.gameStatus.isOver) {
        if (game.gameStatus.result === 'checkmate') {
            score += (game.turn === 'b' ? 20000 : -20000);
        } else {
            score = 0;  // Stalemate or insufficient material
        }
    }

    return score;
}




function getAllPieces(game) {
    const pieces = [];
    const color = game.turn;
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const piece = game.board[i][j];
            if (piece !== '.' &&
                ((color === 'w' && piece === piece.toUpperCase()) ||
                    (color === 'b' && piece === piece.toLowerCase()))) {
                pieces.push({ row: i, col: j, piece });
            }
        }
    }
    return pieces;
}
/**
 * Generates all possible moves for the specified player.
 * @param {Object} game - The current game instance.
 * @param {string} color - 'w' for White or 'b' for Black.
 * @returns {Array} - Array of move objects.
 */
function generateMoves(game, color = game.turn) {
    console.log('Generating moves for the current game state.');
    const moves = [];
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const piece = game.board[i][j];
            if (piece !== '.' && ((color === 'w' && piece === piece.toUpperCase()) || (color === 'b' && piece === piece.toLowerCase()))) {
                moves.push(...generatePieceMoves(game, [i, j]));
            }
        }
    }
    console.log(`Total moves generated: ${moves.length}`);
    return moves;
}

/**
 * Generates all possible moves for a specific piece.
 * @param {Object} game - The current game instance.
 * @param {Array} position - [x, y] position of the piece.
 * @returns {Array} - Array of move objects.
 */
function generatePieceMoves(game, position) {
    const [x, y] = position;
    const piece = game.board[x][y].toLowerCase();
    const moves = [];

    switch (piece) {
        case 'p':
            moves.push(...generatePawnMoves(game, position));
            break;
        case 'n':
            moves.push(...generateKnightMoves(game, position));
            break;
        case 'b':
            moves.push(...generateBishopMoves(game, position));
            break;
        case 'r':
            moves.push(...generateRookMoves(game, position));
            break;
        case 'q':
            moves.push(...generateQueenMoves(game, position));
            break;
        case 'k':
            moves.push(...generateKingMoves(game, position));
            break;
    }
    console.log(`Generated ${moves.length} moves for piece ${piece} at position ${position}.`);
    return moves;
}

/**
 * Generates all possible pawn moves from a given position.
 * @param {Object} game - The current game instance.
 * @param {Array} position - [x, y] position of the pawn.
 * @returns {Array} - Array of move objects.
 */
function generatePawnMoves(game, position) {
    const [x, y] = position;
    const moves = [];
    const direction = game.turn === 'w' ? -1 : 1;  // White moves up (-1), Black moves down (+1)
    const promotionRow = game.turn === 'w' ? 0 : 5; // Row where promotion happens

    // Single step forward
    if (x + direction >= 0 && x + direction < 6) {
        if (game.board[x + direction][y] === '.') {  // Check if the square directly in front is empty
            if (x + direction === promotionRow) {
                // Move to the promotion row, add promotion move
                moves.push({ from: position, to: [x + direction, y], promotion: 'q' });
            } else {
                // Regular forward move
                moves.push({ from: position, to: [x + direction, y] });
            }
        }
    }

    // Double step forward from the starting position
    const canDoubleMove = (game.turn === 'w' && x === 4) || (game.turn === 'b' && x === 1);
    if (canDoubleMove && game.board[x + direction][y] === '.' && game.board[x + 2 * direction][y] === '.') {
        moves.push({ from: position, to: [x + 2 * direction, y] });
    }

    // Captures (diagonal moves)
    for (const side of [-1, 1]) {
        if (y + side >= 0 && y + side < 5 && x + direction >= 0 && x + direction < 6) {
            const targetPiece = game.board[x + direction][y + side];
            if (targetPiece !== '.' &&
                ((game.turn === 'w' && targetPiece === targetPiece.toLowerCase()) ||
                    (game.turn === 'b' && targetPiece === targetPiece.toUpperCase()))) {
                if (x + direction === promotionRow) {
                    // Capture and promote on the last row
                    moves.push({ from: position, to: [x + direction, y + side], promotion: 'q' });
                } else {
                    // Regular capture
                    moves.push({ from: position, to: [x + direction, y + side] });
                }
            }
        }
    }

    return moves;
}

/**
 * Generates all possible knight moves from a given position.
 * @param {Object} game - The current game instance.
 * @param {Array} position - [x, y] position of the knight.
 * @returns {Array} - Array of move objects.
 */
function generateKnightMoves(game, position) {
    const [x, y] = position;
    const moves = [];
    const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
    ];

    for (const [dx, dy] of knightMoves) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 5) {
            const target = game.board[nx][ny];
            if (target === '.' || (game.turn === 'w' && target === target.toLowerCase()) || (game.turn === 'b' && target === target.toUpperCase())) {
                moves.push({ from: position, to: [nx, ny] });
                console.log(`Knight move to [${nx}, ${ny}] added.`);
            }
        }
    }

    return moves;
}

/**
 * Generates all possible queen moves from a given position.
 * @param {Object} game - The current game instance.
 * @param {Array} position - [x, y] position of the queen.
 * @returns {Array} - Array of move objects.
 */
function generateQueenMoves(game, position) {
    console.log('Generating queen moves.');
    const rookMoves = generateRookMoves(game, position);
    const bishopMoves = generateBishopMoves(game, position);

    return rookMoves.concat(bishopMoves);
}

/**
 * Generates all possible rook moves from a given position.
 * @param {Object} game - The current game instance.
 * @param {Array} position - [x, y] position of the rook.
 * @returns {Array} - Array of move objects.
 */
function generateRookMoves(game, position) {
    const [x, y] = position;
    const moves = [];
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // Down, Up, Right, Left

    for (const [dx, dy] of directions) {
        let nx = x + dx;
        let ny = y + dy;
        while (nx >= 0 && nx < 6 && ny >= 0 && ny < 5) { // Ensure the position is within board bounds
            const target = game.board[nx][ny];
            if (target === '.') { // Empty square
                moves.push({ from: position, to: [nx, ny] });
                console.log(`Rook move to [${nx}, ${ny}] added.`);
            } else {
                // If it's an opponent's piece, we can capture it
                if ((game.turn === 'w' && target === target.toLowerCase()) || (game.turn === 'b' && target === target.toUpperCase())) {
                    moves.push({ from: position, to: [nx, ny] });
                    console.log(`Rook capture move to [${nx}, ${ny}] added.`);
                }
                break;
            }
            nx += dx;
            ny += dy;
        }
    }

    return moves;
}

/**
 * Generates all possible bishop moves from a given position.
 * @param {Object} game - The current game instance.
 * @param {Array} position - [x, y] position of the bishop.
 * @returns {Array} - Array of move objects.
 */
function generateBishopMoves(game, position) {
    const [x, y] = position;
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dx, dy] of directions) {
        let nx = x + dx;
        let ny = y + dy;
        while (nx >= 0 && nx < 6 && ny >= 0 && ny < 5) {
            const target = game.board[nx][ny];
            if (target === '.') { // Empty square
                moves.push({ from: position, to: [nx, ny] });
                console.log(`Bishop move to [${nx}, ${ny}] added.`);
            } else {
                // If it's an opponent's piece, we can capture it
                if ((game.turn === 'w' && target === target.toLowerCase()) || (game.turn === 'b' && target === target.toUpperCase())) {
                    moves.push({ from: position, to: [nx, ny] });
                    console.log(`Bishop capture move to [${nx}, ${ny}] added.`);
                }
                break; // Stop moving in this direction after encountering a piece
            }
            nx += dx;
            ny += dy;
        }
    }

    return moves;
}

/**
 * Generates all possible king moves from a given position.
 * @param {Object} game - The current game instance.
 * @param {Array} position - [x, y] position of the king.
 * @returns {Array} - Array of move objects.
 */
function generateKingMoves(game, position) {
    const [x, y] = position;
    const moves = [];
    const kingMoves = [
        [1, 0], [-1, 0], [0, 1], [0, -1], // Horizontal and vertical moves
        [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal moves
    ];

    for (const [dx, dy] of kingMoves) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 5) { // Ensure within bounds
            const target = game.board[nx][ny];
            if (target === '.' || (game.turn === 'w' && target === target.toLowerCase()) || (game.turn === 'b' && target === target.toUpperCase())) {
                moves.push({ from: position, to: [nx, ny] });
                console.log(`King move to [${nx}, ${ny}] added.`);
            }
        }
    }

    return moves;
}