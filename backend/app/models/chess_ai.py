import random
import time
import hashlib
from copy import deepcopy
from ..constants import ROWS, COLS

class ChessAI:
    def __init__(self, depth=2):
        self.depth = depth
        self.killer_moves = {d: [] for d in range(depth + 1)}
        self.transposition_table = {}
        self.nodes_evaluated = 0

    def _hash_board(self, game_state):
        board_str = ''
        for row in range(ROWS):
            for col in range(COLS):
                piece = game_state.board[row][col]
                board_str += f"{piece.team}_{piece.type}_{piece.value}" if piece else '0'
        board_str += game_state.turn
        return hashlib.md5(board_str.encode()).hexdigest()

    def evaluate_board(self, game_state):
        self.nodes_evaluated += 1
        score = 0
        black_king_pos = None
        white_king_pos = None
        pawn_counts = {'black': [0] * COLS, 'white': [0] * COLS}

        for row in range(ROWS):
            for col in range(COLS):
                piece = game_state.board[row][col]
                if piece:
                    multiplier = 1 if piece.team == 'black' else -1
                    score += multiplier * piece.value

                    if piece.type == 'king':
                        if piece.team == 'black':
                            black_king_pos = (row, col)
                        else:
                            white_king_pos = (row, col)

                    if piece.type == 'pawn':
                        pawn_counts[piece.team][col] += 1
                        if piece.team == 'black':
                            score += multiplier * 0.2 * row
                        else:
                            score += multiplier * 0.2 * (ROWS - 1 - row)

                    if 1 <= row <= 4 and 1 <= col <= 3:
                        score += multiplier * 0.15
                    elif 0 <= row <= 5 and 0 <= col <= 4:
                        score += multiplier * 0.05

                    if piece.type == 'knight':
                        center_dist = abs(2.5 - col) + abs(2.5 - row)
                        score += multiplier * (3 - center_dist) * 0.1

                    moves = game_state.get_valid_moves(row, col)
                    score += multiplier * len(moves) * 0.15

        for col in range(COLS):
            for team in ['black', 'white']:
                multiplier = 1 if team == 'black' else -1
                if pawn_counts[team][col] > 1:
                    score += multiplier * -0.6
                if pawn_counts[team][col] > 0 and all(pawn_counts[team][c] == 0 for c in [col-1, col+1] if 0 <= c < COLS):
                    score += multiplier * -0.4

        if black_king_pos and white_king_pos:
            for team, king_pos in [('black', black_king_pos), ('white', white_king_pos)]:
                multiplier = 1 if team == 'black' else -1
                king_row, king_col = king_pos
                for r in range(king_row - 1, king_row + 2):
                    for c in range(king_col - 1, king_col + 2):
                        if 0 <= r < ROWS and 0 <= c < COLS and game_state.board[r][c] and game_state.board[r][c].type == 'pawn' and game_state.board[r][c].team == team:
                            score += multiplier * 0.3
                if not any(game_state.board[r][king_col] and game_state.board[r][king_col].type == 'pawn' for r in range(ROWS)):
                    score += multiplier * -0.4

        if game_state.is_in_check('white'):
            score += 0.7
        elif game_state.is_in_check('black'):
            score -= 0.7

        if game_state.game_over:
            if game_state.is_checkmate('white'):
                return float('inf')
            elif game_state.is_checkmate('black'):
                return -float('inf')
            elif game_state.is_stalemate(game_state.turn):
                return 0

        return score

    def order_moves(self, game_state, moves, team, depth):
        def move_score(move):
            start, end = move
            score = 0

            target = game_state.board[end[0]][end[1]]
            if target and target.team != team:
                score += target.value * 100

            new_state = deepcopy(game_state)
            new_state.move_piece(start[0], start[1], end[0], end[1])
            opponent = 'white' if team == 'black' else 'black'
            if new_state.is_in_check(opponent):
                score += 70
            if new_state.is_checkmate(opponent):
                score += 10000

            piece = game_state.board[start[0]][start[1]]
            if piece.type == 'pawn':
                if (team == 'black' and end[0] == ROWS - 1) or (team == 'white' and end[0] == 0):
                    score += 900

            if 1 <= end[0] <= 4 and 1 <= end[1] <= 3:
                score += 15

            return score

        ordered_moves = []
        seen = set()
        for move in self.killer_moves.get(depth, []):
            if move in moves and move not in seen:
                ordered_moves.append(move)
                seen.add(move)

        for move in moves:
            if move not in seen:
                ordered_moves.append(move)

        return sorted(ordered_moves, key=move_score, reverse=True)

    def minimax(self, game_state, depth, alpha, beta, team):
        board_hash = self._hash_board(game_state)
        if board_hash in self.transposition_table and self.transposition_table[board_hash][0] >= depth:
            return self.transposition_table[board_hash][1], self.transposition_table[board_hash][2]

        if depth == 0 or game_state.game_over:
            score = self.evaluate_board(game_state)
            self.transposition_table[board_hash] = (depth, score, None)
            return score, None

        best_move = None
        maximizing = (team == game_state.turn)
        if maximizing:
            max_eval = float('-inf')
            moves = game_state.get_all_possible_moves(team)
            moves = self.order_moves(game_state, moves, team, depth)

            for start, end in moves:
                new_state = deepcopy(game_state)
                new_state.move_piece(start[0], start[1], end[0], end[1])
                eval_score, _ = self.minimax(new_state, depth - 1, alpha, beta, team)

                if eval_score > max_eval:
                    max_eval = eval_score
                    best_move = (start, end)

                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    if len(self.killer_moves[depth]) < 2 and (start, end) not in self.killer_moves[depth]:
                        self.killer_moves[depth].append((start, end))
                    break

            self.transposition_table[board_hash] = (depth, max_eval, best_move)
            return max_eval, best_move

        else:
            min_eval = float('inf')
            opponent = 'white' if team == 'black' else 'black'
            moves = game_state.get_all_possible_moves(opponent)
            moves = self.order_moves(game_state, moves, opponent, depth)

            for start, end in moves:
                new_state = deepcopy(game_state)
                new_state.move_piece(start[0], start[1], end[0], end[1])
                eval_score, _ = self.minimax(new_state, depth - 1, alpha, beta, team)

                if eval_score < min_eval:
                    min_eval = eval_score
                    best_move = (start, end)

                beta = min(beta, eval_score)
                if beta <= alpha:
                    if len(self.killer_moves[depth]) < 2 and (start, end) not in self.killer_moves[depth]:
                        self.killer_moves[depth].append((start, end))
                    break

            self.transposition_table[board_hash] = (depth, min_eval, best_move)
            return min_eval, best_move

    def make_move(self, game_state, team):
        game_state.ai_thinking = True
        self.nodes_evaluated = 0
        best_move = None
        start_time = time.time()
        time_limit = 5.0

        for d in range(1, self.depth + 1):
            if time.time() - start_time > time_limit:
                break
            self.killer_moves[d] = []
            _, move = self.minimax(game_state, d, float('-inf'), float('inf'), team)
            if move:
                best_move = move

        if best_move:
            start, end = best_move
            game_state.move_piece(start[0], start[1], end[0], end[1])
        game_state.ai_thinking = False
        return best_move