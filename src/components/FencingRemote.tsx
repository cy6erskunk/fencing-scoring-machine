import React, { useState, useEffect, useCallback } from 'react';
import { Timer, RotateCcw, Play, Pause, Square } from 'lucide-react';

interface FencingState {
  leftScore: number;
  rightScore: number;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  leftCards: { yellow: number; red: number };
  rightCards: { yellow: number; red: number };
  matchCount: number;
}

const FencingRemote: React.FC = () => {
  const [state, setState] = useState<FencingState>({
    leftScore: 0,
    rightScore: 0,
    timeRemaining: 180, // 3 minutes
    isRunning: false,
    isPaused: false,
    leftCards: { yellow: 0, red: 0 },
    rightCards: { yellow: 0, red: 0 },
    matchCount: 0,
  });

  const [lastSetClick, setLastSetClick] = useState<number>(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isRunning && !state.isPaused && state.timeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state.isRunning, state.isPaused, state.timeRemaining]);

  // Auto-stop when time reaches 0
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning) {
      setState(prev => ({ ...prev, isRunning: false, isPaused: false }));
    }
  }, [state.timeRemaining, state.isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    setState(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      isPaused: false
    }));
  };

  const handlePause = () => {
    if (state.isRunning) {
      setState(prev => ({
        ...prev,
        isPaused: !prev.isPaused
      }));
    }
  };

  const handleAddPoint = (side: 'left' | 'right') => {
    setState(prev => ({
      ...prev,
      [side === 'left' ? 'leftScore' : 'rightScore']: 
        prev[side === 'left' ? 'leftScore' : 'rightScore'] + 1
    }));
  };

  const handleRemovePoint = (side: 'left' | 'right') => {
    setState(prev => ({
      ...prev,
      [side === 'left' ? 'leftScore' : 'rightScore']: 
        Math.max(0, prev[side === 'left' ? 'leftScore' : 'rightScore'] - 1)
    }));
  };

  const handleMiseAZero = () => {
    setState(prev => ({
      ...prev,
      leftScore: 0,
      rightScore: 0
    }));
  };

  const handleSet = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastSetClick;
    
    if (timeSinceLastClick < 500) { // Double click within 500ms
      // Set to 1 minute
      setState(prev => ({
        ...prev,
        timeRemaining: 60,
        isRunning: false,
        isPaused: false
      }));
    } else {
      // Single click - set to 3 minutes
      setState(prev => ({
        ...prev,
        timeRemaining: 180,
        isRunning: false,
        isPaused: false
      }));
    }
    
    setLastSetClick(now);
  };

  const handleCard = (side: 'left' | 'right', type: 'yellow' | 'red') => {
    setState(prev => ({
      ...prev,
      [side === 'left' ? 'leftCards' : 'rightCards']: {
        ...prev[side === 'left' ? 'leftCards' : 'rightCards'],
        [type]: prev[side === 'left' ? 'leftCards' : 'rightCards'][type] + 1
      }
    }));
  };

  const handleMatchCount = () => {
    setState(prev => ({
      ...prev,
      matchCount: prev.matchCount + 1
    }));
  };

  const Button: React.FC<{
    color: string;
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
  }> = ({ color, children, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`
        w-16 h-16 rounded-full font-bold text-sm shadow-lg
        transform transition-all duration-150 active:scale-95
        hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50
        ${color} ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-row gap-8 items-center">
      {/* Remote Control */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
        
        <div className="grid grid-cols-3 gap-3">
          {/* Row 1 */}
          <Button
            color="bg-green-500 hover:bg-green-400 text-white"
            onClick={handleStartStop}
          >
            {state.isRunning ? 'STOP' : 'START'}
          </Button>
          <Button
            color="bg-yellow-500 hover:bg-yellow-400 text-black"
            onClick={() => {}} // Rearm does nothing
          >
            REARM
          </Button>
          <Button
            color="bg-green-500 hover:bg-green-400 text-white"
            onClick={handlePause}
          >
            PAUSE<br/>1MIN
          </Button>

          {/* Row 2 */}
          <Button
            color="bg-red-500 hover:bg-red-400 text-white"
            onClick={() => handleAddPoint('left')}
          >
            +
          </Button>
          <Button
            color="bg-red-500 hover:bg-red-400 text-white"
            onClick={handleMiseAZero}
          >
            MISE A<br/>ZERO
          </Button>
          <Button
            color="bg-red-500 hover:bg-red-400 text-white"
            onClick={() => handleAddPoint('right')}
          >
            +
          </Button>

          {/* Row 3 */}
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => handleCard('left', 'red')}
          >
            CARD<br/>ROUGE
          </Button>
          <Button
            color="bg-green-500 hover:bg-green-400 text-white"
            onClick={handleSet}
          >
            SET
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => handleCard('right', 'red')}
          >
            CARD<br/>ROUGE
          </Button>

          {/* Row 4 */}
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => handleCard('left', 'yellow')}
          >
            CARD<br/>JAUNE
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={handleMatchCount}
          >
            MATCH<br/>COUNT
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => handleCard('right', 'yellow')}
          >
            CARD<br/>JAUNE
          </Button>

          {/* Row 5 */}
          <Button
            color="bg-red-500 hover:bg-red-400 text-white"
            onClick={() => handleRemovePoint('left')}
          >
            -
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => {}} // P MAN does nothing in this simulator
          >
            P<br/>MAN
          </Button>
          <Button
            color="bg-red-500 hover:bg-red-400 text-white"
            onClick={() => handleRemovePoint('right')}
          >
            -
          </Button>

          {/* Row 6 */}
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => {}} // Block does nothing
          >
            BLOCK
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => {}} // P CAS does nothing in this simulator
          >
            P<br/>CAS
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => {}} // Telec acquis does nothing
          >
            TELEC<br/>ACQUIS
          </Button>
        </div>

      </div>

      {/* Scoring Display */}
      <div className="bg-black text-white p-8 rounded-lg shadow-2xl min-w-[400px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">FENCING SCORING</h1>
          <div className="text-4xl font-mono font-bold">
            {formatTime(state.timeRemaining)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {state.isRunning && !state.isPaused && (
              <Play className="w-4 h-4 text-green-400" />
            )}
            {state.isPaused && (
              <Pause className="w-4 h-4 text-yellow-400" />
            )}
            {!state.isRunning && (
              <Square className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm">
              {state.isRunning ? (state.isPaused ? 'PAUSED' : 'RUNNING') : 'STOPPED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Fencer */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">LEFT</div>
            <div className="text-6xl font-mono font-bold mb-4">{state.leftScore}</div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">{state.leftCards.yellow}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">{state.leftCards.red}</span>
              </div>
            </div>
          </div>

          {/* Right Fencer */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">RIGHT</div>
            <div className="text-6xl font-mono font-bold mb-4">{state.rightScore}</div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">{state.rightCards.yellow}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm">{state.rightCards.red}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-gray-600">
          <div className="text-sm text-gray-400">Match Count</div>
          <div className="text-2xl font-bold">{state.matchCount}</div>
        </div>
      </div>
    </div>
  );
};

export default FencingRemote;