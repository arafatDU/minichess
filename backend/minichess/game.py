from typing import List, Tuple, Dict, Optional, Set
import copy

class MiniChessGame:
    """
    Implementation of a 6x5 Minichess game
    """
    
    def __init__(self):
        """Initialize a new minichess game with a 6x5 board"""
        # Initialize the board with a 6x5 grid
        # Board representation: None for empty, (color, piece_type) for pieces
        # color: 'w' for white, 'b' for black
        # piece_type: 'P' for pawn, 'R' for rook, 'N' for knight, 'B' for bishop, 'Q' for queen, 'K' for king
        self.board = [[None for _ in range(5)] for _ in range(6)]
        
        # Set up the initial board state
        self.board[0] = [('b', 'R'), ('b', 'N'), ('b', 'B'), ('b', 'Q'), ('b', 'K')]
        self.board[1] = [('b', 'P') for _ in range(5)]
        

        self.board[4] = [('w', 'P') for _ in range(5)]
        self.board[5] = [('w', 'R'), ('w', 'N'), ('w', 'B'), ('w', 'Q'), ('w', 'K')]
        
        # White starts
        self.current_player = 'w'
        
        # Keep track of kings' positions for easy check detection
        self.kings_pos = {
            'w': (5, 4),  
            'b': (0, 4)   
        }
        

        self.game_over = False
        self.winner = None   
        self.move_history = []
        
        # Castling availability (keeps track if king or rooks have moved)
        self.castling = {
            'w': {'king_moved': False, 'rook_moved': {'a': False, 'h': False}},
            'b': {'king_moved': False, 'rook_moved': {'a': False, 'h': False}}
        }

        
    def get_board_state(self) -> List[List[Optional[Tuple[str, str]]]]:
        """Return a copy of the current board state"""
        return copy.deepcopy(self.board)
        
    
    def get_game_status(self) -> Dict:
        """Return the current game status"""
        return {
            'game_over': self.game_over,
            'winner': self.winner,
            'current_player': self.current_player
        }
        
    def is_game_over(self) -> bool:
        """Check if the game is over"""
        return self.game_over
    
    def get_winner(self) -> Optional[str]:
        """Return the winner of the game if there is one"""
        return self.winner
    
    def is_valid_position(self, pos: Tuple[int, int]) -> bool:
        """Check if a position is on the board"""
        row, col = pos
        return 0 <= row < 6 and 0 <= col < 5
    
    def is_empty(self, pos: Tuple[int, int]) -> bool:
        """Check if a position is empty"""
        row, col = pos
        return self.board[row][col] is None
    
    def get_piece_at(self, pos: Tuple[int, int]) -> Optional[Tuple[str, str]]:
        """Get the piece at a position"""
        row, col = pos
        return self.board[row][col]
    
    def is_piece_color(self, pos: Tuple[int, int], color: str) -> bool:
        """Check if a piece at a position is of a specific color"""
        piece = self.get_piece_at(pos)
        return piece is not None and piece[0] == color
    
    def _get_pawn_moves(self, pos: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Get all valid moves for a pawn at the given position"""
        row, col = pos
        color, _ = self.board[row][col]
        moves = []
        
        # Determine direction based on color
        direction = -1 if color == 'w' else 1
        
        # Forward move
        forward = (row + direction, col)
        if self.is_valid_position(forward) and self.is_empty(forward):
            moves.append(forward)
        
        # Diagonal captures
        captures = [(row + direction, col - 1), (row + direction, col + 1)]
        for capture in captures:
            if self.is_valid_position(capture) and not self.is_empty(capture) and not self.is_piece_color(capture, color):
                moves.append(capture)
        
        return moves
    
    def _get_rook_moves(self, pos: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Get all valid moves for a rook at the given position"""
        row, col = pos
        color, _ = self.board[row][col]
        moves = []
        
        # Define directions for rook movement (horizontal and vertical)
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        
        for dr, dc in directions:
            for i in range(1, max(6, 5)):  # Max board dimensions
                new_row, new_col = row + i * dr, col + i * dc
                new_pos = (new_row, new_col)
                
                if not self.is_valid_position(new_pos):
                    break
                
                if self.is_empty(new_pos):
                    moves.append(new_pos)
                else:
                    if not self.is_piece_color(new_pos, color):
                        moves.append(new_pos)  # Capture opponent's piece
                    break  # Can't move past a piece
        
        return moves

