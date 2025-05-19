from ..models.game_state import GameState
from ..models.chess_ai import ChessAI
from ..schemas.game import GameStateSchema

class GameService:
    def __init__(self):
        self.game_state = GameState()
        self.chess_ai_white = None
        self.chess_ai_black = ChessAI(depth=2)
        self.mode = "ai"
        self.ai_depth_white = 2
        self.ai_depth_black = 2

    def init_game(self, mode: str = "ai", ai_depth_white: int = 2, ai_depth_black: int = 2) -> GameStateSchema:
        self.mode = mode
        self.ai_depth_white = ai_depth_white
        self.ai_depth_black = ai_depth_black

        if mode == "ai":
            self.chess_ai_white = None
            self.chess_ai_black = ChessAI(depth=ai_depth_black)
        elif mode == "ai_vs_ai":
            self.chess_ai_white = ChessAI(depth=ai_depth_white)
            self.chess_ai_black = ChessAI(depth=ai_depth_black)
        else:  # human mode
            self.chess_ai_white = None
            self.chess_ai_black = None

        self.game_state = GameState()
        return GameStateSchema.from_orm(self.game_state)

    def select_piece(self, row: int, col: int) -> GameStateSchema:
        success = self.game_state.select_piece(row, col)
        if not success:
            self.game_state.message = "Invalid piece selection"
        return GameStateSchema.from_orm(self.game_state)

    def make_move(self, start_row: int, start_col: int, end_row: int, end_col: int) -> GameStateSchema:
        if self.game_state.ai_thinking or self.game_state.game_over:
            self.game_state.message = "Invalid move: Game is processing or over"
            return GameStateSchema.from_orm(self.game_state)

        if self.game_state.selected_piece != (start_row, start_col):
            self.game_state.message = "Piece not selected"
            return GameStateSchema.from_orm(self.game_state)

        if (end_row, end_col) not in self.game_state.valid_moves:
            self.game_state.message = "Invalid move"
            return GameStateSchema.from_orm(self.game_state)

        piece = self.game_state.board[start_row][start_col]
        if not piece or piece.team != self.game_state.turn:
            self.game_state.message = "Invalid move: Not your turn"
            return GameStateSchema.from_orm(self.game_state)

        self.game_state.move_piece(start_row, start_col, end_row, end_col)
        return GameStateSchema.from_orm(self.game_state)

    def make_ai_move(self) -> GameStateSchema:
        if self.game_state.ai_thinking or self.game_state.game_over:
            self.game_state.message = "Invalid AI move request"
            return GameStateSchema.from_orm(self.game_state)

        if self.mode == "ai" and self.game_state.turn == 'black' and self.chess_ai_black:
            best_move = self.chess_ai_black.make_move(self.game_state, 'black')
            response = GameStateSchema.from_orm(self.game_state)
            response.nodes_evaluated = self.chess_ai_black.nodes_evaluated
            return response
        elif self.mode == "ai_vs_ai":
            if self.game_state.turn == 'white' and self.chess_ai_white:
                best_move = self.chess_ai_white.make_move(self.game_state, 'white')
                response = GameStateSchema.from_orm(self.game_state)
                response.nodes_evaluated = self.chess_ai_white.nodes_evaluated
                return response
            elif self.game_state.turn == 'black' and self.chess_ai_black:
                best_move = self.chess_ai_black.make_move(self.game_state, 'black')
                response = GameStateSchema.from_orm(self.game_state)
                response.nodes_evaluated = self.chess_ai_black.nodes_evaluated
                return response
        self.game_state.message = "Invalid AI move request"
        return GameStateSchema.from_orm(self.game_state)

    def get_game_state(self) -> GameStateSchema:
        return GameStateSchema.from_orm(self.game_state)