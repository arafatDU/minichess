'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ChessBoardProps {
  boardState: any;
  currentPlayer: string;
  onMove: (from: string, to: string) => void;
  gameStatus: {
    game_over: boolean;
    winner: string | null;
    current_player: string;
  };
  isLoading?: boolean;
  error?: string | null;
  validMoves: string[];
  onGetValidMoves: (pos: string) => void;
}

const ChessBoard = ({ 
  boardState, 
  currentPlayer, 
  onMove, 
  gameStatus, 
  isLoading, 
  error,
  validMoves,
  onGetValidMoves
}: ChessBoardProps) => {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [selectedPiecePos, setSelectedPiecePos] = useState<string | null>(null);

  // Function to get the square color
  const getSquareColor = (row: number, col: number) => {
    return (row + col) % 2 === 0 ? 'bg-amber-200 dark:bg-amber-900' : 'bg-amber-500 dark:bg-amber-700';
  };

  // Function to convert position to algebraic notation
  const posToAlgebraic = (row: number, col: number) => {
    return `${String.fromCharCode(97 + col)}${6 - row}`;
  };

  // Function to handle piece selection
  const handlePieceSelect = (row: number, col: number) => {
    if (gameStatus.game_over) return;
    
    const piece = boardState[row]?.[col];
    const pos = posToAlgebraic(row, col);
    
    if (selectedPiece && selectedPiecePos) {
      // If a piece is already selected, try to move it
      if (pos !== selectedPiecePos) {
        onMove(selectedPiecePos, pos);
      }
      setSelectedPiece(null);
      setSelectedPiecePos(null);
    } else if (piece && piece[0] === currentPlayer) {
      // Select the piece if it belongs to the current player
      setSelectedPiece(piece[1]);
      setSelectedPiecePos(pos);
      onGetValidMoves(pos);
    }
  };

  // Render the chess piece
  const renderPiece = (piece: [string, string] | null) => {
    if (!piece) return null;
    
    const [color, type] = piece;
    const pieceSymbols: Record<string, string> = {
      'K': '♚',
      'Q': '♛',
      'R': '♜',
      'B': '♝',
      'N': '♞',
      'P': '♟'
    };
    
    return (
      <span className={`text-4xl ${color === 'w' ? 'text-gray-100' : 'text-gray-800'}`}>
        {pieceSymbols[type]}
      </span>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading game board...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-4 text-destructive">
        <p className="text-center font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">Please ensure the backend server is running at http://localhost:8000</p>
      </div>
    );
  }

  // Check if a board exists
  if (!boardState) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">No game board available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-5 gap-0 border-2 border-amber-800 dark:border-amber-600 max-w-[400px] mx-auto">
        {Array.from({ length: 6 }).map((_, row) => (
          Array.from({ length: 5 }).map((_, col) => {
            const pos = posToAlgebraic(row, col);
            const isSelected = selectedPiecePos === pos;
            const isValidMove = validMoves.includes(pos);
            
            return (
              <div 
                key={`${row}-${col}`}
                className={`
                  aspect-square flex items-center justify-center cursor-pointer relative
                  ${getSquareColor(row, col)}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                  hover:opacity-90
                `}
                onClick={() => handlePieceSelect(row, col)}
              >
                {/* Piece */}
                {boardState[row]?.[col] && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="z-10"
                  >
                    {renderPiece(boardState[row][col])}
                  </motion.div>
                )}
                
                {/* Position label (bottom left of each square) */}
                <div className="absolute bottom-0 left-1 text-xs opacity-50">
                  {pos}
                </div>
                
                {/* Valid move indicator */}
                {isValidMove && !boardState[row]?.[col] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 opacity-60"></div>
                  </div>
                )}
                
                {/* Capture indicator */}
                {isValidMove && boardState[row]?.[col] && boardState[row][col][0] !== currentPlayer && (
                  <div className="absolute inset-0 ring-2 ring-red-500 ring-inset"></div>
                )}
              </div>
            );
          })
        ))}
      </div>
      
      {gameStatus.game_over && (
        <div className="mt-4 p-3 bg-primary/10 rounded-md text-center">
          <p className="font-medium">
            Game Over! 
            {gameStatus.winner ? 
              ` ${gameStatus.winner === 'w' ? 'White' : 'Black'} wins!` : 
              ' It\'s a draw.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;