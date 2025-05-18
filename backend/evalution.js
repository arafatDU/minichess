// const { generateMoves } = require('../models/gameLogic');

// exports.evaluateBoard = (game) => {
//     let score = 0;
//     const board = game.board;

//     // Define piece values and additional heuristic values
//     const pieceValues = {
//         'p': 1,
//         'n': 3,
//         'b': 3.3,
//         'r': 5,
//         'q': 9,
//         'k': 0
//     };

//     const positionBonuses = {
//         'p': [
//             [0, 0, 0, 0, 0],
//             [0.5, 0.5, 0.5, 0.5, 0.5],
//             [0.2, 0.2, 0.3, 0.2, 0.2],
//             [0.1, 0.1, 0.2, 0.1, 0.1],
//             [0, 0, 0, 0, 0],
//             [0, 0, 0, 0, 0]
//         ],
//         'n': [
//             [0, 0.1, 0.2, 0.1, 0],
//             [0.1, 0.2, 0.4, 0.2, 0.1],
//             [0.2, 0.3, 0.5, 0.3, 0.2],
//             [0.2, 0.3, 0.5, 0.3, 0.2],
//             [0.1, 0.2, 0.4, 0.2, 0.1],
//             [0, 0.1, 0.2, 0.1, 0]
//         ],
//         'b': [
//             [0, 0.1, 0.2, 0.1, 0],
//             [0.1, 0.2, 0.3, 0.2, 0.1],
//             [0.1, 0.3, 0.4, 0.3, 0.1],
//             [0.1, 0.3, 0.4, 0.3, 0.1],
//             [0.1, 0.2, 0.3, 0.2, 0.1],
//             [0, 0.1, 0.2, 0.1, 0]
//         ],
//         'r': [
//             [0.2, 0.3, 0.3, 0.3, 0.2],
//             [0.3, 0.4, 0.4, 0.4, 0.3],
//             [0.1, 0.2, 0.2, 0.2, 0.1],
//             [0.1, 0.2, 0.2, 0.2, 0.1],
//             [0.1, 0.2, 0.2, 0.2, 0.1],
//             [0, 0, 0, 0, 0]
//         ],
//         'q': [
//             [0.2, 0.3, 0.3, 0.3, 0.2],
//             [0.3, 0.4, 0.4, 0.4, 0.3],
//             [0.2, 0.3, 0.3, 0.3, 0.2],
//             [0.2, 0.3, 0.3, 0.3, 0.2],
//             [0.1, 0.2, 0.2, 0.2, 0.1],
//             [0, 0.1, 0.2, 0.1, 0]
//         ],
//         'k': [
//             [-0.3, -0.4, -0.4, -0.4, -0.3],
//             [-0.4, -0.5, -0.5, -0.5, -0.4],
//             [-0.4, -0.5, -0.5, -0.5, -0.4],
//             [-0.4, -0.5, -0.5, -0.5, -0.4],
//             [-0.3, -0.4, -0.4, -0.4, -0.3],
//             [0, 0, 0, 0, 0]
//         ]
//     };

//     // Loop through each piece on the board
//     for (let i = 0; i < board.length; i++) {
//         for (let j = 0; j < board[i].length; j++) {
//             const piece = board[i][j];
//             if (piece && piece !== '.') {
//                 const pieceType = piece.toLowerCase();
//                 let value = pieceValues[pieceType];

//                 // Adjust score based on position bonuses
//                 if (positionBonuses[pieceType]) {
//                     const posValue = positionBonuses[pieceType][i][j];
//                     value += posValue;
//                 }
//                  // King safety
//                  if (pieceType === 'k') {
//                     const isKingExposed = (i === 0 || i === 5) && (j === 0 || j === 4); // Example exposure check
//                     if (isKingExposed) value -= 2; // Penalty for exposure
//                 }

//                 // Pawn structure: Penalty for isolated or doubled pawns
//                 if (pieceType === 'p') {
//                     const isIsolated = !board[i - 1]?.[j]?.toLowerCase() === 'p' && !board[i + 1]?.[j]?.toLowerCase() === 'p';
//                     const isDoubled = i > 0 && board[i - 1][j]?.toLowerCase() === 'p';
//                     if (isIsolated) value -= 0.3;
//                     if (isDoubled) value -= 0.5;
//                 }

//                 // Add score based on piece color
//                 score += piece === piece.toUpperCase() ? value : -value;
//             }
//         }
//     }

//     // Mobility heuristic: Count available moves for each side
//     const whiteMoves = generateMoves(game, 'w').length;
//     const blackMoves = generateMoves(game, 'b').length;
//     score += (whiteMoves - blackMoves) * 0.1; // Encourage mobility
//     return score;
// };