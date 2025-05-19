export interface GameState {
  board: Array<Array<{ team: string; type: string; value: number; has_moved: boolean } | null>>;
  turn: string;
  selected_piece: [number, number] | null;
  valid_moves: Array<[number, number]>;
  last_move: [[number, number], [number, number]] | null;
  game_over: boolean;
  message: string;
  ai_thinking: boolean;
  check: { white: boolean; black: boolean };
  nodes_evaluated: number | null;
}

interface Move {
  start_row: number;
  start_col: number;
  end_row: number;
  end_col: number;
}

interface GameInit {
  mode: 'ai' | 'human' | 'ai_vs_ai';
  ai_depth_white?: number;
  ai_depth_black?: number;
}

const API_URL = 'http://localhost:8000';

export async function initGame(init: GameInit): Promise<GameState> {
  const response = await fetch(`${API_URL}/game/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: init.mode,
      ai_depth_white: init.ai_depth_white ?? 2,
      ai_depth_black: init.ai_depth_black ?? 2,
    }),
  });
  if (!response.ok) throw new Error(`Failed to initialize game: ${response.statusText}`);
  return response.json();
}

export async function getGameState(): Promise<GameState> {
  const response = await fetch(`${API_URL}/game/state`);
  if (!response.ok) throw new Error(`Failed to fetch game state: ${response.statusText}`);
  return response.json();
}

export async function selectPiece(row: number, col: number): Promise<GameState> {
  const response = await fetch(`${API_URL}/game/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col }),
  });
  if (!response.ok) throw new Error(`Failed to select piece: ${response.statusText}`);
  return response.json();
}

export async function makeMove(move: Move): Promise<GameState> {
  const response = await fetch(`${API_URL}/game/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(move),
  });
  if (!response.ok) throw new Error(`Failed to make move: ${response.statusText}`);
  return response.json();
}

export async function makeAIMove(): Promise<GameState> {
  const response = await fetch(`${API_URL}/game/ai_move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error(`Failed to make AI move: ${response.statusText}`);
  return response.json();
}