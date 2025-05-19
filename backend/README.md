```markdown
# MiniChess Backend

Backend for a 6x5 chess-like game using FastAPI, with AI-powered moves.

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd chess-backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file**:
   ```bash
   echo "PORT=8000" > .env
   ```

5. **Run the server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## API Endpoints

- **POST /game/init**: Initialize a new game.
- **POST /game/select**: Select a piece (e.g., `{"row": 4, "col": 2}`).
- **POST /game/move**: Make a player move (e.g., `{"start_row": 4, "start_col": 2, "end_row": 3, "end_col": 2}`).
- **POST /game/ai_move**: Trigger an AI move (black).
- **GET /game/state**: Get current game state.

