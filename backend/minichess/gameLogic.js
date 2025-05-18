// /Server/models/gameLogic.js

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
