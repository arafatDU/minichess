# ♟️ MiniChessAI: Evaluation Criteria & Implementation Details 

## Introduction

MiniChessAI is an artificial intelligence agent designed to play MiniChess (6x5 board — Speed Chess). The AI's strength and play style are determined by its evaluation criteria and implementation choices. This report details the evaluation metrics used to assess board positions, the algorithms powering the AI, and other relevant implementation details.

## Evaluation Criteria

The AI evaluates each board state using a weighted sum of several chess-specific features. The main criteria are:

### 1. Material Balance
- **Definition:** The total value of all pieces for both sides.
- **Implementation:** Each piece type is assigned a standard value (Pawn: 1, Knight/Bishop: 3, Rook: 5, Queen: 9, King: very high value to prevent loss).
- **Purpose:** Encourages the AI to capture opponent pieces and avoid losing its own.

### 2. Piece Activity & Mobility
- **Definition:** The number of legal moves available to each side.
- **Implementation:** The AI counts all possible moves for its pieces and subtracts the opponent's mobility.
- **Purpose:** Favors positions where the AI has more options and flexibility.

### 3. Pawn Structure
- **Definition:** The arrangement and support of pawns.
- **Implementation:** Penalties for doubled, isolated, or backward pawns; bonuses for connected and advanced pawns.
- **Purpose:** Promotes strong, cohesive pawn formations and discourages weaknesses.

### 4. King Safety
- **Definition:** The vulnerability of the king to attack.
- **Implementation:** Penalties if the king is exposed (few surrounding pawns/pieces) or under direct threat.
- **Purpose:** Encourages castling and keeping the king protected.

### 5. Center Control
- **Definition:** Occupation and influence over central squares.
- **Implementation:** Bonuses for pieces controlling or occupying the central 2x2 or 3x3 area.
- **Purpose:** Central control increases piece effectiveness and flexibility.

### 6. Threats and Tactical Motifs
- **Definition:** Immediate threats such as checks, forks, pins, and discovered attacks.
- **Implementation:** Small bonuses for giving check, attacking high-value pieces, or creating tactical threats.
- **Purpose:** Encourages the AI to create and exploit tactical opportunities.

### 7. Game End Conditions
- **Checkmate:** Returns a large positive/negative value depending on the winner.
- **Stalemate:** Returns zero, indicating a draw.
- **Draw by Insufficient Material or Repetition:** Returns zero.

## Specific Scoring Values

The AI evaluates positions by assigning numerical scores to various elements:

| Feature | Point Value | Notes |
|---------|-------------|-------|
| **Material Values** | | |
| Pawn | 1.0 | Basic unit of value |
| Knight | 3.0 | Slightly stronger in restricted 6x5 board |
| Bishop | 3.0 | Equal to knight in this implementation |
| Rook | 5.0 | Powerful especially in endgames |
| King | 1000.0 | Effectively infinite (must be protected) |
| **Position Bonuses** | | |
| Center square control (inner 2x2) | +0.15 | Bonus per piece in center |
| Extended center control | +0.05 | Bonus for pieces in the 3x3 area |
| Knight proximity to center | +0.1 × (3 - distance) | Knights are better near center |
| **Pawn Structure** | | |
| Doubled pawns | -0.6 | Penalty per doubled pawn |
| Isolated pawns | -0.4 | Pawns with no friendly pawns in adjacent columns |
| Advanced pawns | +0.2 × row | Bonus increases as pawns advance (multiplied by row) |
| **King Safety** | | |
| Pawn near king | +0.3 | Bonus for each pawn adjacent to king |
| King without pawn protection | -0.4 | Penalty for exposed king file |
| **Mobility** | | |
| Legal moves | +0.15 per move | Bonus for each possible move |
| **Tactical Elements** | | |
| Check | +0.7 | Bonus for putting opponent in check |
| Checkmate | ±∞ | Game ending condition |
| Stalemate | 0 | Draw value |

### Scoring Formula

The final evaluation score is calculated as

Positive scores favor Black, while negative scores favor White (due to implementation choice).

## Implementation Details

### Search Algorithm
- **Minimax with Alpha-Beta Pruning:** The AI simulates possible move sequences for both sides up to a fixed depth, using alpha-beta pruning to skip unpromising branches and improve efficiency.
- **Iterative Deepening:** The AI increases search depth incrementally, allowing it to return the best move found within a time limit.
- **Move Ordering:** Captures, checks, and threats are searched first to maximize pruning effectiveness.

### Evaluation Function
- The evaluation function is called at each leaf node of the search tree and combines all criteria above into a single score.
- Weights for each criterion are tuned through testing and self-play.

### Performance Optimizations
- **Transposition Table:** Caches previously evaluated positions to avoid redundant calculations.
- **Move Generation:** Efficient move generation routines minimize computation time.

### User Interface & Integration

Here are screenshots showcasing the UI for different stages and game modes:


![Screenshot from 2025-05-19 11-06-01](https://github.com/user-attachments/assets/6a317ccf-a54d-4174-98e7-30dc4e424528)

- The main menu offers three modes:
  - **Human vs AI** (with a pawn icon)
  - **Human vs Human** (with user icons)
  - **AI vs AI** (with a robot icon)


![Screenshot from 2025-05-19 11-06-10](https://github.com/user-attachments/assets/57621a37-f435-4323-be02-2b6bd4d92cc0)


- In Human vs AI mode, players select AI difficulty depth:
  - Depth 1 (Beginner friendly)
  - Depth 2 (Balanced challenge)
  - Depth 3 (Experienced players)


![Screenshot from 2025-05-19 11-06-20](https://github.com/user-attachments/assets/05d40842-2a24-4f26-90ac-0d0e22833a14)

- The gameplay screen features a 6x5 chessboard styled for MiniChess.
- A status bar indicates whose turn it is.
- Option to go back to menu is available.

### Technology Stack
- **Backend:** Python (FastAPI) handles game logic, move validation, and AI computation.
- **Frontend:** Next.js (React) provides an interactive chessboard and user controls.
- **Game Modes:** Supports Human vs AI, AI vs AI, and Human vs Human.

### Testing & Validation
- The AI is tested against known MiniChess puzzles and through self-play to ensure it makes reasonable decisions and avoids blunders.
- Unit tests cover move generation, evaluation, and endgame detection.

## Conclusion

MiniChessAI combines classic chess AI techniques with optimizations for the 6x5 board. Its evaluation function balances material, mobility, king safety, pawn structure, and tactical awareness, resulting in a challenging and adaptable opponent. The implementation is modular, efficient, and supports multiple play modes for both casual and competitive use.

---


