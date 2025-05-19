
export interface Piece {
  team: 'white' | 'black';
  type: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  value: number;
  has_moved: boolean;
}

export interface Move {
  start_row: number;
  start_col: number;
  end_row: number;
  end_col: number;
}

export interface GameState {
  board: (Piece | null)[][];
  turn: 'white' | 'black';
  selected_piece: [number, number] | null;
  valid_moves: [number, number][];
  last_move: [[number, number], [number, number]] | null;
  game_over: boolean;
  message: string;
  ai_thinking: boolean;
  check: { white: boolean; black: boolean };
  nodes_evaluated: number | null;
}
