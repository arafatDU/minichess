from copy import deepcopy
from .piece import Piece
from ..constants import ROWS, COLS

class GameState:
    def __init__(self):
        self.board = self.initialize_board()
        self.turn = 'white'
        self.selected_piece = None
        self.valid_moves = []
        self.last_move = None
        self.game_over = False
        self.message = ""
        self.ai_thinking = False
        self.check = {'white': False, 'black': False}
    
    def initialize_board(self):
        board = [[None for _ in range(COLS)] for _ in range(ROWS)]
        
        for col in range(COLS):
            board[1][col] = Piece('black', 'pawn', 1)
            board[4][col] = Piece('white', 'pawn', 1)
        
        board[0][0] = Piece('black', 'rook', 5)
        board[0][1] = Piece('black', 'knight', 3)
        board[0][2] = Piece('black', 'king', 1000)
        board[0][3] = Piece('black', 'bishop', 3)
        board[0][4] = Piece('black', 'rook', 5)
        
        board[5][0] = Piece('white', 'rook', 5)
        board[5][1] = Piece('white', 'knight', 3)
        board[5][2] = Piece('white', 'king', 1000)
        board[5][3] = Piece('white', 'bishop', 3)
        board[5][4] = Piece('white', 'rook', 5)
        
        return board
    
    def select_piece(self, row, col):
        piece = self.board[row][col]
        if piece and piece.team == self.turn:
            self.selected_piece = (row, col)
            self.valid_moves = self.get_valid_moves(row, col)
            return True
        return False
    
    def move_piece(self, start_row, start_col, end_row, end_col):
        piece = self.board[start_row][start_col]
        self.board[end_row][end_col] = piece
        self.board[start_row][start_col] = None
        piece.has_moved = True
        
        if piece.type == 'pawn':
            if (piece.team == 'white' and end_row == 0) or (piece.team == 'black' and end_row == ROWS - 1):
                self.board[end_row][end_col] = Piece(piece.team, 'queen', 9)
        
        self.last_move = ((start_row, start_col), (end_row, end_col))
        self.check = {'white': self.is_in_check('white'), 'black': self.is_in_check('black')}
        self.turn = 'black' if self.turn == 'white' else 'white'
        self.selected_piece = None
        self.valid_moves = []
        
        if self.is_checkmate(self.turn):
            self.game_over = True
            winner = 'white' if self.turn == 'black' else 'black'
            self.message = f"Checkmate! {winner.capitalize()} wins!"
        elif self.is_stalemate(self.turn):
            self.game_over = True
            self.message = "Stalemate! Game is a draw."
    
    def get_valid_moves(self, row, col):
        piece = self.board[row][col]
        if not piece:
            return []
        
        moves = []
        if piece.type == 'pawn':
            moves = self.get_pawn_moves(row, col)
        elif piece.type == 'knight':
            moves = self.get_knight_moves(row, col)
        elif piece.type == 'bishop':
            moves = self.get_bishop_moves(row, col)
        elif piece.type == 'rook':
            moves = self.get_rook_moves(row, col)
        elif piece.type == 'queen':
            moves = self.get_queen_moves(row, col)
        elif piece.type == 'king':
            moves = self.get_king_moves(row, col)
        
        valid_moves = []
        for move in moves:
            if not self.would_move_cause_check(row, col, move[0], move[1], piece.team):
                valid_moves.append(move)
        
        return valid_moves
    
    def get_pawn_moves(self, row, col):
        moves = []
        piece = self.board[row][col]
        direction = -1 if piece.team == 'white' else 1
        
        if 0 <= row + direction < ROWS and self.board[row + direction][col] is None:
            moves.append((row + direction, col))
            if ((piece.team == 'white' and row == 4) or (piece.team == 'black' and row == 1)) and self.board[row + 2*direction][col] is None:
                moves.append((row + 2*direction, col))
        
        for c_offset in [-1, 1]:
            if 0 <= col + c_offset < COLS and 0 <= row + direction < ROWS:
                target = self.board[row + direction][col + c_offset]
                if target and target.team != piece.team:
                    moves.append((row + direction, col + c_offset))
        
        return moves
    
    def get_knight_moves(self, row, col):
        moves = []
        piece = self.board[row][col]
        knight_moves = [(-2, -1), (-2, 1), (-1, -2), (-1, 2), (1, -2), (1, 2), (2, -1), (2, 1)]
        
        for dr, dc in knight_moves:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < ROWS and 0 <= new_col < COLS:
                target = self.board[new_row][new_col]
                if target is None or target.team != piece.team:
                    moves.append((new_row, new_col))
        
        return moves
    
    def get_bishop_moves(self, row, col):
        moves = []
        piece = self.board[row][col]
        directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
        
        for dr, dc in directions:
            for i in range(1, max(ROWS, COLS)):
                new_row, new_col = row + dr * i, col + dc * i
                if 0 <= new_row < ROWS and 0 <= new_col < COLS:
                    target = self.board[new_row][new_col]
                    if target is None:
                        moves.append((new_row, new_col))
                    elif target.team != piece.team:
                        moves.append((new_row, new_col))
                        break
                    else:
                        break
                else:
                    break
        
        return moves
    
    def get_rook_moves(self, row, col):
        moves = []
        piece = self.board[row][col]
        directions = [(0, -1), (0, 1), (-1, 0), (1, 0)]
        
        for dr, dc in directions:
            for i in range(1, max(ROWS, COLS)):
                new_row, new_col = row + dr * i, col + dc * i
                if 0 <= new_row < ROWS and 0 <= new_col < COLS:
                    target = self.board[new_row][new_col]
                    if target is None:
                        moves.append((new_row, new_col))
                    elif target.team != piece.team:
                        moves.append((new_row, new_col))
                        break
                    else:
                        break
                else:
                    break
        
        return moves
    
    def get_queen_moves(self, row, col):
        return self.get_bishop_moves(row, col) + self.get_rook_moves(row, col)
    
    def get_king_moves(self, row, col):
        moves = []
        piece = self.board[row][col]
        king_moves = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
        
        for dr, dc in king_moves:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < ROWS and 0 <= new_col < COLS:
                target = self.board[new_row][new_col]
                if target is None or target.team != piece.team:
                    moves.append((new_row, new_col))
        
        return moves
    
    def get_all_possible_moves(self, team):
        all_moves = []
        for row in range(ROWS):
            for col in range(COLS):
                piece = self.board[row][col]
                if piece and piece.team == team:
                    moves = self.get_valid_moves(row, col)
                    for move in moves:
                        all_moves.append(((row, col), move))
        return all_moves
    
    def would_move_cause_check(self, start_row, start_col, end_row, end_col, team):
        temp_board = deepcopy(self.board)
        temp_board[end_row][end_col] = temp_board[start_row][start_col]
        temp_board[start_row][start_col] = None
        
        king_pos = None
        for r in range(ROWS):
            for c in range(COLS):
                piece = temp_board[r][c]
                if piece and piece.team == team and piece.type == 'king':
                    king_pos = (r, c)
                    break
            if king_pos:
                break
        
        opponent = 'black' if team == 'white' else 'white'
        for r in range(ROWS):
            for c in range(COLS):
                piece = temp_board[r][c]
                if piece and piece.team == opponent:
                    if piece.type == 'pawn':
                        direction = -1 if piece.team == 'white' else 1
                        for c_offset in [-1, 1]:
                            if 0 <= r + direction < ROWS and 0 <= c + c_offset < COLS:
                                if (r + direction, c + c_offset) == king_pos:
                                    return True
                    elif self.can_piece_reach(temp_board, r, c, king_pos[0], king_pos[1], piece.type):
                        return True
        
        return False
    
    def can_piece_reach(self, board, start_row, start_col, end_row, end_col, piece_type):
        if piece_type == 'knight':
            knight_moves = [(-2, -1), (-2, 1), (-1, -2), (-1, 2), (1, -2), (1, 2), (2, -1), (2, 1)]
            return (end_row - start_row, end_col - start_col) in knight_moves
        
        elif piece_type == 'king':
            dr = abs(end_row - start_row)
            dc = abs(end_col - start_col)
            return dr <= 1 and dc <= 1
        
        elif piece_type == 'rook':
            if start_row != end_row and start_col != end_col:
                return False
            if start_row == end_row:
                start_c, end_c = min(start_col, end_col), max(start_col, end_col)
                for c in range(start_c + 1, end_c):
                    if board[start_row][c]:
                        return False
            else:
                start_r, end_r = min(start_row, end_row), max(start_row, end_row)
                for r in range(start_r + 1, end_r):
                    if board[r][start_col]:
                        return False
            return True
        
        elif piece_type == 'bishop':
            dr = abs(end_row - start_row)
            dc = abs(end_col - start_col)
            if dr != dc:
                return False
            r_dir = 1 if end_row > start_row else -1
            c_dir = 1 if end_col > start_col else -1
            r, c = start_row + r_dir, start_col + c_dir
            while r != end_row and c != end_col:
                if board[r][c]:
                    return False
                r += r_dir
                c += c_dir
            return True
        
        elif piece_type == 'queen':
            return (self.can_piece_reach(board, start_row, start_col, end_row, end_col, 'rook') or
                    self.can_piece_reach(board, start_row, start_col, end_row, end_col, 'bishop'))
        
        return False
    
    def is_in_check(self, team):
        king_pos = None
        for r in range(ROWS):
            for c in range(COLS):
                piece = self.board[r][c]
                if piece and piece.team == team and piece.type == 'king':
                    king_pos = (r, c)
                    break
            if king_pos:
                break
        
        if not king_pos:
            return False
        
        opponent = 'black' if team == 'white' else 'white'
        for r in range(ROWS):
            for c in range(COLS):
                piece = self.board[r][c]
                if piece and piece.team == opponent:
                    if piece.type == 'pawn':
                        direction = -1 if piece.team == 'white' else 1
                        for c_offset in [-1, 1]:
                            if 0 <= r + direction < ROWS and 0 <= c + c_offset < COLS:
                                if (r + direction, c + c_offset) == king_pos:
                                    return True
                    elif self.can_piece_reach(self.board, r, c, king_pos[0], king_pos[1], piece.type):
                        return True
        
        return False
    
    def is_checkmate(self, team):
        if not self.is_in_check(team):
            return False
        
        for r in range(ROWS):
            for c in range(COLS):
                piece = self.board[r][c]
                if piece and piece.team == team:
                    valid_moves = self.get_valid_moves(r, c)
                    if valid_moves:
                        return False
        
        return True
    
    def is_stalemate(self, team):
        if self.is_in_check(team):
            return False
        
        for r in range(ROWS):
            for c in range(COLS):
                piece = self.board[r][c]
                if piece and piece.team == team:
                    valid_moves = self.get_valid_moves(r, c)
                    if valid_moves:
                        return False
        
        return True
