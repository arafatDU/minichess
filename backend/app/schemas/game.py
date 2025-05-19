
from pydantic import BaseModel
from typing import Optional, List, Tuple, Dict

class PieceSchema(BaseModel):
    team: str
    type: str
    value: int
    has_moved: bool

    class Config:
        from_attributes = True

class BoardSchema(BaseModel):
    board: List[List[Optional[PieceSchema]]]

class MoveSchema(BaseModel):
    start_row: int
    start_col: int
    end_row: int
    end_col: int

class GameStateSchema(BaseModel):
    board: List[List[Optional[PieceSchema]]]
    turn: str
    selected_piece: Optional[Tuple[int, int]]
    valid_moves: List[Tuple[int, int]]
    last_move: Optional[Tuple[Tuple[int, int], Tuple[int, int]]]
    game_over: bool
    message: str
    ai_thinking: bool
    check: Dict[str, bool]
    nodes_evaluated: Optional[int] = None

    class Config:
        from_attributes = True
