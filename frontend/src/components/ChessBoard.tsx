'use client';

import { memo } from 'react';
import { GameState } from './types';

interface ChessBoardProps {
  gameState: GameState;
  onSelectPiece: (row: number, col: number) => void;
  onMove: (start_row: number, start_col: number, end_row: number, end_col: number) => void;
  isAIThinking: boolean;
  gameMode?: 'ai' | 'human' | 'ai_vs_ai';
}

function ChessBoard({ gameState, onSelectPiece, onMove, isAIThinking, gameMode }: ChessBoardProps) {
  // Disable sound by setting to null
  const moveSound = null; // Sounds disabled
  
  const getPieceSymbol = (piece: GameState['board'][0][0]) => {
    if (!piece) return '\u00A0'; // Non-breaking space
    const symbols: Record<string, { white: string; black: string }> = {
      pawn: { white: '♙', black: '♟' },
      knight: { white: '♘', black: '♞' },
      bishop: { white: '♗', black: '♝' },
      rook: { white: '♖', black: '♜' },
      queen: { white: '♕', black: '♛' },
      king: { white: '♔', black: '♚' },
    };
    return symbols[piece.type]?.[piece.team as 'white' | 'black'] || '\u00A0';
  };

  const isLastMove = (row: number, col: number) => {
    if (!gameState.last_move) return false;
    const [[start_row, start_col], [end_row, end_col]] = gameState.last_move;
    return (row === start_row && col === start_col) || (row === end_row && col === end_col);
  };

  const isInCheck = (row: number, col: number) => {
    const piece = gameState.board[row]?.[col];
    return piece && piece.type === 'king' && gameState.check[piece.team];
  };

  const handleClick = (row: number, col: number) => {
    if (gameMode === 'ai_vs_ai' || isAIThinking || gameState.ai_thinking || gameState.game_over) return;
    if (gameState.selected_piece) {
      const [start_row, start_col] = gameState.selected_piece;
      if (gameState.valid_moves.some(([r, c]) => r === row && c === col)) {
        onMove(start_row, start_col, row, col);
        // Sound disabled, so no need to play it
      } else {
        onSelectPiece(row, col);
      }
    } else {
      onSelectPiece(row, col);
    }
  };

  const isDisabled = gameMode === 'ai' && (isAIThinking || gameState.ai_thinking);

  return (
    <div className="flex flex-col">
      {/* Status Indicator Bar - Centered with white text */}
      <div className="w-full mb-2 flex justify-center">
        <div 
          className="bg-gradient-to-r from-[#3a3a3a] to-[#1f1f1f] px-6 py-3 rounded-lg shadow-lg border border-[#4a4a4a] flex items-center justify-center"
          style={{ 
            width: 'min(100vw, 500px)', 
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.05em',
            textAlign: 'center'
          }}
        >
          <div 
            className={`w-4 h-4 rounded-full mr-3 ${
              gameState.turn === 'white' 
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]' 
                : 'bg-gray-900 shadow-[0_0_8px_rgba(0,0,0,0.7)]'
            }`}
          ></div>
          <p 
            className="text-white font-semibold"
            style={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              color: '#ffffff'
            }}
          >
            {gameState.turn === 'white' ? 'White\'s move' : 'Black\'s move'}
          </p>
          {(isAIThinking || gameState.ai_thinking) && (
            <div className="ml-5 flex items-center pl-4 border-l border-gray-600">
              <div className="w-3 h-3 rounded-full bg-blue-400 mr-2 animate-pulse opacity-80"></div>
              <p className="text-white italic" style={{ fontFamily: 'Raleway, sans-serif' }}>
                AI thinking...
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Chessboard */}
      <div className={`chessboard mx-auto ${isDisabled ? 'disabled' : ''}`}>
        {gameState.board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${rowIndex % 2 === colIndex % 2 ? 'light-square' : 'dark-square'} ${
                gameState.selected_piece &&
                gameState.selected_piece[0] === rowIndex &&
                gameState.selected_piece[1] === colIndex
                  ? 'selected'
                  : ''
              } ${
                gameState.valid_moves.some(([r, c]) => r === rowIndex && c === colIndex) ? 'valid-move' : ''
              } ${isLastMove(rowIndex, colIndex) ? 'last-move' : ''} ${isInCheck(rowIndex, colIndex) ? 'check' : ''}`}
              onClick={() => handleClick(rowIndex, colIndex)}
              dangerouslySetInnerHTML={{ __html: getPieceSymbol(piece) }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default memo(ChessBoard);