'use client';

import { useEffect, useState } from 'react';
import { GameState } from '../lib/api';
import './GameStatus.css';
import Confetti from 'react-confetti';

interface GameStatusProps {
  gameState: GameState;
  onRestart: () => void;
  isAIThinking: boolean;
  gameMode: 'ai' | 'human' | 'ai_vs_ai';
}

export default function GameStatus({ gameState, onRestart, isAIThinking, gameMode }: GameStatusProps) {
  const isCheckmate = gameState.message?.toLowerCase().includes('checkmate');
  const isStalemate = gameState.message?.toLowerCase().includes('stalemate');
  const checkmateSound = null; // Disabled sounds
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    // Set confetti to active when checkmate is detected
    if (isCheckmate) {
      setConfettiActive(true);
      
      // Set initial window size
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    // Resize handler for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== 'undefined') {
      handleResize(); // Set initial size
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isCheckmate]);

  const handleRetry = () => {
    setConfettiActive(false);
    onRestart();
  };

  return (
    <>
      {gameState.game_over && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          {/* Confetti celebration that covers the entire screen */}
          {confettiActive && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={800}
              recycle={true}
              tweenDuration={10000}
              gravity={0.15}
              initialVelocityY={10}
              initialVelocityX={5}
              colors={['#FFD700', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F1C40F', '#E67E22', '#FFFFFF', '#1ABC9C']}
              confettiSource={{
                x: 0,
                y: 0,
                w: windowSize.width,
                h: 0
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 100,
                pointerEvents: 'none'
              }}
            />
          )}
          <div 
            className="bg-gradient-to-r from-[#3a3a3a] to-[#1f1f1f] px-8 py-6 rounded-lg shadow-lg border border-[#4a4a4a] z-[101]"
            style={{ 
              maxWidth: '500px',
              width: '90%',
              fontFamily: 'Cinzel, serif',
              letterSpacing: '0.05em',
              textAlign: 'center'
            }}
          >
            <div className="mb-6 flex flex-col items-center">
              <div 
                className="text-6xl mb-4 animate-pulse"
                style={{ 
                  color: '#ffffff',
                  textShadow: '0 0 12px rgba(255,255,255,0.7), 0 0 20px rgba(255,215,0,0.8)'
                }}
              >
                {isCheckmate ? '♔' : isStalemate ? '=' : '🏁'}
              </div>
              <h3 
                className="text-3xl font-bold mb-4"
                style={{ 
                  color: '#ffffff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}
              >
                {isCheckmate ? 'Checkmate!' : isStalemate ? 'Stalemate!' : 'Game Over!'}
              </h3>
              <p 
                className="text-white text-lg"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
              >
                {gameState.message}
              </p>
            </div>
            <button 
              className="bg-gradient-to-r from-[#E74C3C] to-[#C0392B] text-white py-3 px-8 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={handleRetry}
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}