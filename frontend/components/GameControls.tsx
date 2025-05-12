'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider'; 
import { RefreshCw, Cpu, ChevronRight, Layers } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onAIMove: (depth: number) => void;
  gameStatus: {
    game_over: boolean;
    winner: string | null;
    current_player: string;
  };
  isLoading: boolean;
  currentPlayer: string;
}

const GameControls = ({ 
  onNewGame, 
  onAIMove, 
  gameStatus, 
  isLoading,
  currentPlayer
}: GameControlsProps) => {
  const [depth, setDepth] = useState<number>(3);

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Search Depth</label>
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {depth}
            </span>
          </div>
          <Slider 
            value={[depth]} 
            min={1} 
            max={5} 
            step={1} 
            onValueChange={(value) => setDepth(value[0])}
            className="py-2"
          />
          <p className="text-xs text-muted-foreground">Higher values make stronger moves but take longer to calculate</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            size="lg"
            onClick={onNewGame}
            disabled={isLoading}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            New Game
          </Button>
          
          <Button 
            variant="default"
            size="lg"
            onClick={() => onAIMove(depth)}
            disabled={isLoading || gameStatus.game_over}
            className="flex items-center justify-center gap-2"
          >
            <Cpu size={16} />
            AI Move
          </Button>
        </div>
        
        <div className="mt-4 border border-border rounded-md p-3">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Layers size={14} />
            How to Play
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-start gap-1">
              <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
              <span>Click a piece to select it</span>
            </li>
            <li className="flex items-start gap-1">
              <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
              <span>Click a valid square to move</span>
            </li>
            <li className="flex items-start gap-1">
              <ChevronRight size={14} className="mt-0.5 flex-shrink-0" />
              <span>Use the AI Move button to let the computer play</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameControls;