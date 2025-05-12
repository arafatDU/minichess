from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Tuple, Optional
import uuid

from minichess.game import MiniChessGame



app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Store active games
active_games: Dict[str, MiniChessGame] = {}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/new-game")
async def create_new_game(depth: int = 3):
    game_id = str(uuid.uuid4())
    active_games[game_id] = MiniChessGame()
    return {"game_id": game_id, "board": active_games[game_id].get_board_state()}



@app.get("/game/{game_id}")
async def get_game(game_id: str):
    """Get the current state of a game"""
    if game_id not in active_games:
        return {"error": "Game not found"}
    
    game = active_games[game_id]
    return {
        "board": game.get_board_state(),
        "current_player": game.current_player,
        "status": game.get_game_status()
    }


@app.get("/valid-moves/{game_id}")
async def get_valid_moves(game_id: str, pos: str):
    """Get valid moves for a piece at the given position"""
    return {"moves": ["dummy-move1", "dummy-move2"]}


@app.post("/move/{game_id}")
async def make_move(game_id: str, from_pos: str, to_pos: str):
    """Make a move in the specified game"""
    return {
        "success": True,
        "board": "dummy-board-state",
        "current_player": "dummy-player",
        "status": "dummy-status"
    }


@app.post("/ai-move/{game_id}")
async def make_ai_move(game_id: str, depth: int = 3):
    """Make an AI move in the specified game"""
    return {
        "success": True,
        "board": "dummy-board-state",
        "current_player": "dummy-player",
        "status": "dummy-status",
        "analysis": {"best_move": ["dummy-from", "dummy-to"]},
        "move": {"from": "dummy-from", "to": "dummy-to"}
    }