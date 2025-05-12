'use client';

import { useState } from 'react';
import ChessBoard from '@/components/ChessBoard';
import GameControls from '@/components/GameControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { Github } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';

export default function Home() {
  const { 
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
  } = useGameState();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">Minichess AI</h1>
            
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github size={20} />
            </a>
            <ModeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-1 lg:order-1">
            <Card className="overflow-hidden border border-border">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Game Board</CardTitle>
                  <div className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {currentPlayer === 'w' ? 'White to move' : 'Black to move'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ChessBoard 
                  boardState={boardState} 
                  currentPlayer={currentPlayer}
                  onMove={makeMove}
                  gameStatus={gameStatus}
                  isLoading={isLoading}
                  error={error}
                  validMoves={validMoves}
                  onGetValidMoves={getValidMoves}
                />
              </CardContent>
            </Card>
            
            <GameControls 
              onNewGame={createNewGame} 
              onAIMove={makeAIMove}
              gameStatus={gameStatus}
              isLoading={isLoading}
              currentPlayer={currentPlayer}
            />
          </div>



        </div>
      </div>
    </main>
  );
}