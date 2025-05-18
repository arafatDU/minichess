

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