from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.game_service import GameService
from ..schemas.game import GameStateSchema, MoveSchema

router = APIRouter()
game_service = GameService()

class GameInitRequest(BaseModel):
    mode: str = "ai"
    ai_depth_white: int = 2
    ai_depth_black: int = 2

@router.post("/game/init", response_model=GameStateSchema)
async def init_game(request: GameInitRequest):
    print(f"Initializing game with mode: {request.mode}, AI depth white: {request.ai_depth_white}, AI depth black: {request.ai_depth_black}")
    if request.mode not in ["ai", "human", "ai_vs_ai"]:
        raise HTTPException(status_code=400, detail="Mode must be 'ai', 'human', or 'ai_vs_ai'")
    return game_service.init_game(request.mode, request.ai_depth_white, request.ai_depth_black)

@router.post("/game/select", response_model=GameStateSchema)
async def select_piece(position: dict):
    row, col = position.get("row"), position.get("col")
    if not (isinstance(row, int) and isinstance(col, int) and 0 <= row < 6 and 0 <= col < 5):
        raise HTTPException(status_code=400, detail="Invalid position")
    return game_service.select_piece(row, col)

@router.post("/game/move", response_model=GameStateSchema)
async def make_move(move: MoveSchema):
    return game_service.make_move(move.start_row, move.start_col, move.end_row, move.end_col)

@router.post("/game/ai_move", response_model=GameStateSchema)
async def make_ai_move():
    return game_service.make_ai_move()

@router.get("/game/state", response_model=GameStateSchema)
async def get_game_state():
    return game_service.get_game_state()