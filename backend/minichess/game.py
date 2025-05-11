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