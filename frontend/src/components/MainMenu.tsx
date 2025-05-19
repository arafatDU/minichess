'use client';

import { useState, useEffect } from 'react';

interface MainMenuProps {
  onSelectMode: (mode: 'ai' | 'human' | 'ai_vs_ai', depthWhite?: number, depthBlack?: number) => void;
}

export default function MainMenu({ onSelectMode }: MainMenuProps) {
  const [showDifficulty, setShowDifficulty] = useState<'none' | 'ai' | 'ai_vs_ai_white' | 'ai_vs_ai_black'>('none');
  const [whiteDepth, setWhiteDepth] = useState<number | null>(null);
  const [titleBounce, setTitleBounce] = useState(0);

  // Animation effect for the title
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleBounce(prev => (prev + 1) % 60);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Calculate bounce transform based on a sine wave
  const getBounceTransform = () => {
    const bounceHeight = Math.sin(titleBounce / 9.5) * 8;
    return `translateY(${bounceHeight}px)`;
  };

  const handlePlayVsAI = () => setShowDifficulty('ai');
  const handleAIVsAI = () => setShowDifficulty('ai_vs_ai_white');

  const handleDifficultySelect = (depth: number) => {
    if (showDifficulty === 'ai') {
      onSelectMode('ai', depth, depth);
    } else if (showDifficulty === 'ai_vs_ai_white') {
      setWhiteDepth(depth);
      setShowDifficulty('ai_vs_ai_black');
    } else if (showDifficulty === 'ai_vs_ai_black') {
      onSelectMode('ai_vs_ai', whiteDepth ?? 2, depth);
      setWhiteDepth(null);
    }
  };

  if (showDifficulty !== 'none') {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div
          style={{
            backgroundColor: '#8B4513',
            backgroundImage: 'url("/wood1.jpg")',
            backgroundSize: 'cover',
            border: '4px solid #5D4037',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="text-center mb-8">
            <h1 style={{ 
              fontSize: '2.5rem', 
              color: '#FFFFFF', 
              marginBottom: '1rem', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
              transform: getBounceTransform(),
              transition: 'transform 0.1s ease-in-out'
            }}>
              MiniChess
            </h1>
            <h2 style={{ fontSize: '1.5rem', color: '#4E342E', marginBottom: '1.5rem' }}>
              {showDifficulty === 'ai' ? 'Select Depth' :
                showDifficulty === 'ai_vs_ai_white' ? 'White AI Depth' :
                  'Black AI Depth'}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {[{
              depth: 1,
              label: 'Depth 1',
              desc: 'Beginner friendly',
              bgColor: 'linear-gradient(to right, #66BB6A, #43A047)'
            }, {
              depth: 2,
              label: 'Depth 2',
              desc: 'Balanced challenge',
              bgColor: 'linear-gradient(to right, #FFCA28, #FFB300)'
            }, {
              depth: 3,
              label: 'Depth 3',
              desc: '..Experienced players',
              bgColor: 'linear-gradient(to right, #EF5350, #E53935)'
            }].map(({ depth, label, desc, bgColor }) => (
              <button
                key={depth}
                style={{
                  background: bgColor,
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'left',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onClick={() => handleDifficultySelect(depth)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', opacity: 0.9, fontStyle: 'italic' }}>{desc}</span>
                </div>
              </button>
            ))}
            <button
              style={{
                marginTop: '1.5rem',
                background: 'linear-gradient(to bottom, #5D4037, #3E2723)',
                color: 'ivory',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                border: '2px solid rgba(141, 110, 99, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                setShowDifficulty('none');
                setWhiteDepth(null);
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to bottom, #6D4C41, #4E342E)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to bottom, #5D4037, #3E2723)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1200px',
        gap: '20px',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          color: '#FFFFFF',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0px 0px 10px rgba(255, 255, 255, 0.3)',
          marginBottom: '20px',
          fontFamily: 'serif',
          letterSpacing: '0.05em',
          transform: getBounceTransform(),
          transition: 'transform 0.1s ease-in-out'
        }}>
          MiniChess
        </h1>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
          gap: '20px',
        }}>
          {[
            {
              icon: '♟',
              title: 'HUMAN VS AI',
              buttonText: 'Play Now',
              onClick: handlePlayVsAI,
              bg: '#8B4513'
            },
            {
              icon: '👥',
              title: 'HUMAN VS HUMAN',
              buttonText: 'Play Now',
              onClick: () => onSelectMode('human'),
              bg: '#A1887F'
            },
            {
              icon: '🤖',
              title: 'AI VS AI',
              buttonText: 'Watch Match',
              onClick: handleAIVsAI,
              bg: '#795548'
            }
          ].map(({ icon, title, buttonText, onClick, bg }, idx) => (
            <div
              key={idx}
              style={{
                flex: '1 0 auto',
                width: 'calc(33.33% - 20px)',
                minWidth: '200px',
                maxWidth: '350px',
                height: '300px',
                backgroundImage: 'url("/wood1.jpg")',
                backgroundSize: 'cover',
                borderRadius: '1rem',
                border: '4px solid #5D4037',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={onClick}
              role="button"
              tabIndex={0}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
            >
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(2px)',
                borderRadius: '0.75rem'
              }} />
              
              <div style={{ 
                position: 'relative', 
                zIndex: 10, 
                height: '100%', 
                width: '100%',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{ 
                  marginTop: '0.5rem', 
                  color: 'ivory', 
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{icon}</div>
                  <h2 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold', 
                    letterSpacing: '0.1em',
                    fontFamily: 'serif'
                  }}>{title}</h2>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  style={{
                    marginBottom: '1.5rem',
                    background: bg,
                    color: 'black',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '0.75rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(255, 248, 220, 0.5)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    fontFamily: 'serif'
                  }}
                  onMouseOver={(e) => {
                    e.stopPropagation();
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 248, 220, 0.8)';
                  }}
                  onMouseOut={(e) => {
                    e.stopPropagation();
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 248, 220, 0.5)';
                  }}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
