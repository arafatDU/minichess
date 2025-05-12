'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000';

interface BoardState {
  [row: number]: Array<null | [string, string]>;
}

interface GameStatus {
  game_over: boolean;
  winner: null | string;
  current_player: string;
}

interface Analysis {
  best_move: [number, number][];
  score: number;
  nodes_evaluated: number;
  nodes_pruned: number;
  search_time: number;
  max_depth: number;
  early_stopped: boolean;
  evaluation_details: any;
  move_evaluations: any;
  explored_tree: any;
}

export function useGameState() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<string>('w');
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    game_over: false,
    winner: null,
    current_player: 'w'
  });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);

  // Initialize a new game
  const createNewGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if the backend is accessible
      const healthCheck = await axios.get(`${API_BASE_URL}/health`).catch(() => {
        throw new Error('Backend server is not running. Please start the backend server first.');
      });

      const response = await axios.get(`${API_BASE_URL}/new-game`);
      setGameId(response.data.game_id);
      setBoardState(response.data.board);
      setCurrentPlayer('w');
      setGameStatus({
        game_over: false,
        winner: null,
        current_player: 'w'
      });
      setAnalysis(null);
      setValidMoves([]);
      toast.success('New game created!');
    } catch (error: any) {
      console.error('Error creating new game:', error);
      const errorMessage = error.message || 'Failed to create new game';
      setError(errorMessage);
      toast.error(errorMessage);
      setBoardState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get valid moves for a piece
  const getValidMoves = useCallback(async (pos: string) => {
    if (!gameId) return [];
    
    try {
      const response = await axios.get(`${API_BASE_URL}/valid-moves/${gameId}`, {
        params: { pos }
      });
      setValidMoves(response.data.moves);
      return response.data.moves;
    } catch (error) {
      console.error('Error getting valid moves:', error);
      setValidMoves([]);
      return [];
    }
  }, [gameId]);

  // Make a move
  const makeMove = useCallback(async (from: string, to: string) => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/move/${gameId}`, null, {
        params: { from_pos: from, to_pos: to }
      });
      
      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }
      
      setBoardState(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setGameStatus(response.data.status);
      setValidMoves([]);
      
      if (response.data.status.game_over) {
        if (response.data.status.winner) {
          toast.success(`Game over! ${response.data.status.winner === 'w' ? 'White' : 'Black'} wins!`);
        } else {
          toast.info('Game over! It\'s a draw.');
        }
      }
    } catch (error: any) {
      console.error('Error making move:', error);
      const errorMessage = error.message || 'Failed to make move';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Make an AI move
  const makeAIMove = useCallback(async (depth: number = 3) => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/ai-move/${gameId}`, null, {
        params: { depth }
      });
      
      if (response.data.error) {
        toast.error(response.data.error);
        return;
      }
      
      setBoardState(response.data.board);
      setCurrentPlayer(response.data.current_player);
      setGameStatus(response.data.status);
      setAnalysis(response.data.analysis);
      setValidMoves([]);
      
      if (response.data.status.game_over) {
        if (response.data.status.winner) {
          toast.success(`Game over! ${response.data.status.winner === 'w' ? 'White' : 'Black'} wins!`);
        } else {
          toast.info('Game over! It\'s a draw.');
        }
      } else {
        toast.info(`AI moved ${response.data.move.from} to ${response.data.move.to}`);
      }
    } catch (error: any) {
      console.error('Error making AI move:', error);
      const errorMessage = error.message || 'Failed to make AI move';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Initialize game on mount
  useEffect(() => {
    createNewGame();
  }, []);

  return {
    gameId,
    boardState,
    currentPlayer,
    gameStatus,
    analysis,
    isLoading,
    error,
    validMoves,
    createNewGame,
    makeMove,
    makeAIMove,
    getValidMoves
  };
}