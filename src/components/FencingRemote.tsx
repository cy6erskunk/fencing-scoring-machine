import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface FencingState {
  leftScore: number;
  rightScore: number;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  leftCards: { yellow: boolean; red: boolean };
  rightCards: { yellow: boolean; red: boolean };
  matchCount: number;
  priority: 'none' | 'left' | 'right';
}

interface TutorialStep {
  id: string;
  description: string;
  checkCompleted: (state: FencingState) => boolean;
}

interface TutorialScenario {
  id: string;
  name: string;
  description: string;
  initialState: Partial<FencingState>;
  task: string;
  steps: TutorialStep[];
}

// Tutorial scenarios
const tutorialScenarios: TutorialScenario[] = [
  {
    id: 'reset-for-pool',
    name: 'Reset for Pool Match',
    description: 'The score is 5-6, fencer on the right has priority, it\'s 3rd bout, and the fencer on the left has a yellow card. Time is 0:21.',
    initialState: {
      leftScore: 5,
      rightScore: 6,
      timeRemaining: 21,
      priority: 'right',
      matchCount: 3,
      leftCards: { yellow: true, red: false },
      rightCards: { yellow: false, red: false },
    },
    task: 'Reset all the values and prepare for a pool match',
    steps: [
      {
        id: 'reset-time',
        description: 'Reset time to 3:00 (use SET button)',
        checkCompleted: (state) => state.timeRemaining === 180,
      },
      {
        id: 'reset-score',
        description: 'Reset both scores to 0 (use MISE A ZERO button)',
        checkCompleted: (state) => state.leftScore === 0 && state.rightScore === 0,
      },
      {
        id: 'reset-priority',
        description: 'Clear priority indicator (use P MAN or P CAS button)',
        checkCompleted: (state) => state.priority === 'none',
      },
      {
        id: 'reset-cards',
        description: 'Clear all cards (toggle CARD JAUNE on left)',
        checkCompleted: (state) => 
          !state.leftCards.yellow && !state.leftCards.red &&
          !state.rightCards.yellow && !state.rightCards.red,
      },
      {
        id: 'reset-match-count',
        description: 'Turn off match count indicator (cycle to 0)',
        checkCompleted: (state) => state.matchCount === 0,
      },
    ],
  },
];

const DEFAULT_STATE: FencingState = {
  leftScore: 0,
  rightScore: 0,
  timeRemaining: 180, // 3 minutes
  isRunning: false,
  isPaused: false,
  leftCards: { yellow: false, red: false },
  rightCards: { yellow: false, red: false },
  matchCount: 0,
  priority: 'none',
};

const FencingRemote: React.FC = () => {
  const [state, setState] = useState<FencingState>(DEFAULT_STATE);

  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<TutorialScenario | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const [lastSetClick, setLastSetClick] = useState<number>(0);
  const pauseIntervalRef = useRef<number | null>(null);
  const [pauseRemaining, setPauseRemaining] = useState<number | null>(null);

  // Check tutorial step completion
  useEffect(() => {
    if (tutorialMode && currentScenario) {
      const newCompletedSteps = new Set<string>();
      currentScenario.steps.forEach((step) => {
        if (step.checkCompleted(state)) {
          newCompletedSteps.add(step.id);
        }
      });
      setCompletedSteps(newCompletedSteps);
    }
  }, [tutorialMode, currentScenario, state]);

  const startTutorial = (scenario: TutorialScenario) => {
    setCurrentScenario(scenario);
    setTutorialMode(true);
    setCompletedSteps(new Set());
    // Apply initial state
    setState((prev) => ({
      ...prev,
      ...scenario.initialState,
    }));
  };

  const exitTutorial = () => {
    setTutorialMode(false);
    setCurrentScenario(null);
    setCompletedSteps(new Set());
    // Reset to default state
    setState(DEFAULT_STATE);
  };

  const clearScheduledPause = () => {
    if (pauseIntervalRef.current !== null) {
      clearInterval(pauseIntervalRef.current);
      pauseIntervalRef.current = null;
    }
    setPauseRemaining(null);
    setState((prev: FencingState) => ({ ...prev, isPaused: false }));
  };

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;

    if (state.isRunning && !state.isPaused && state.timeRemaining > 0) {
      interval = window.setInterval(() => {
        setState((prev: FencingState) => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));
      }, 1000);
    }

    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [state.isRunning, state.isPaused, state.timeRemaining]);

  // Auto-stop when time reaches 0
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning) {
      clearScheduledPause();
      setState((prev: FencingState) => ({ ...prev, isRunning: false, isPaused: false }));
    }
  }, [state.timeRemaining, state.isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    setState((prev: FencingState) => {
      const nextRunning = !prev.isRunning;
      if (!nextRunning) {
        clearScheduledPause();
      }
      return {
        ...prev,
        isRunning: nextRunning,
        isPaused: false
      };
    });
  };

  const handlePause = () => {
    // Start a fixed 60s pause regardless of running state
    clearScheduledPause();
    setState((prev: FencingState) => ({ ...prev, isPaused: true }));
    setPauseRemaining(60);
    pauseIntervalRef.current = window.setInterval(() => {
      setPauseRemaining((prev: number | null) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (pauseIntervalRef.current !== null) {
            clearInterval(pauseIntervalRef.current);
            pauseIntervalRef.current = null;
          }
          setState((p: FencingState) => ({
            ...p,
            isPaused: false,
            isRunning: false,
            timeRemaining: 180,
            // Only auto-advance matchCount if enabled (>0). Cycle 1→2→3→1.
            matchCount: p.matchCount > 0 ? (p.matchCount === 3 ? 1 : p.matchCount + 1) : 0
          }));
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAddPoint = (side: 'left' | 'right') => {
    setState((prev: FencingState) => ({
      ...prev,
      [side === 'left' ? 'leftScore' : 'rightScore']:
        prev[side === 'left' ? 'leftScore' : 'rightScore'] + 1
    }));
  };

  const handleRemovePoint = (side: 'left' | 'right') => {
    setState((prev: FencingState) => ({
      ...prev,
      [side === 'left' ? 'leftScore' : 'rightScore']:
        Math.max(0, prev[side === 'left' ? 'leftScore' : 'rightScore'] - 1)
    }));
  };

  const handleMiseAZero = () => {
    setState((prev: FencingState) => ({
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
      clearScheduledPause();
      setState((prev: FencingState) => ({
        ...prev,
        timeRemaining: 60,
        isRunning: false,
        isPaused: false
      }));
    } else {
      // Single click - set to 3 minutes
      clearScheduledPause();
      setState((prev: FencingState) => ({
        ...prev,
        timeRemaining: 180,
        isRunning: false,
        isPaused: false
      }));
    }

    setLastSetClick(now);
  };

  const handleCard = (side: 'left' | 'right', type: 'yellow' | 'red') => {
    setState((prev: FencingState) => ({
      ...prev,
      [side === 'left' ? 'leftCards' : 'rightCards']: {
        ...prev[side === 'left' ? 'leftCards' : 'rightCards'],
        [type]: !prev[side === 'left' ? 'leftCards' : 'rightCards'][type]
      }
    }));
  };

  const handleMatchCount = () => {
    setState((prev: FencingState) => {
      const current = prev.matchCount;
      // Manual cycle: 0 → 1 → 2 → 3 → 0
      const next = current === 0 ? 1 : current === 3 ? 0 : current + 1;
      return { ...prev, matchCount: next };
    });
  };

  const handlePriorityManual = () => {
    setState((prev: FencingState) => ({
      ...prev,
      priority: prev.priority === 'none' ? 'left' : prev.priority === 'left' ? 'right' : 'none'
    }));
  };

  const handlePriorityRandom = () => {
    setState((prev: FencingState) => {
      if (prev.priority !== 'none') {
        return { ...prev, priority: 'none' };
      }
      const assigned = Math.random() < 0.5 ? 'left' : 'right';
      return { ...prev, priority: assigned };
    });
  };

  interface RemoteButtonProps {
    color: string;
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    ariaLabel?: string;
    ariaPressed?: boolean;
  }
  function Button({ color, children, onClick, className = '', ariaLabel, ariaPressed }: RemoteButtonProps) {
    return (
      <button
        onClick={onClick}
        className={`
          w-16 h-16 rounded-full font-bold text-sm shadow-lg
          transform transition-all duration-150 active:scale-95
          hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50
          ${color} ${className}
        `}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="flex md:flex-row flex-col-reverse gap-8 items-center">
      {/* Tutorial Mode Panel */}
      {!tutorialMode && (
        <div className="bg-gray-700 p-4 rounded-lg shadow-xl max-w-sm">
          <h2 className="text-white text-xl font-bold mb-3">Practice Mode</h2>
          <p className="text-gray-300 text-sm mb-4">
            Learn how to operate the scoring machine with guided tutorials.
          </p>
          {tutorialScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => startTutorial(scenario)}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 px-4 rounded mb-2 transition-colors"
            >
              {scenario.name}
            </button>
          ))}
        </div>
      )}

      {tutorialMode && currentScenario && (
        <div className="bg-gray-700 p-4 rounded-lg shadow-xl max-w-sm">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-white text-xl font-bold">{currentScenario.name}</h2>
            <button
              onClick={exitTutorial}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="exit tutorial"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-300 text-sm mb-3">{currentScenario.description}</p>
          <div className="bg-gray-800 p-3 rounded mb-3">
            <p className="text-yellow-300 font-semibold text-sm mb-1">Task:</p>
            <p className="text-white text-sm">{currentScenario.task}</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400 text-xs font-semibold uppercase">Steps:</p>
            {currentScenario.steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-2 p-2 rounded ${
                    isCompleted ? 'bg-green-900/30' : 'bg-gray-800'
                  }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  <span className={`text-sm ${isCompleted ? 'text-green-300 line-through' : 'text-white'}`}>
                    {step.description}
                  </span>
                </div>
              );
            })}
          </div>
          {completedSteps.size === currentScenario.steps.length && (
            <div className="mt-4 p-3 bg-green-900/50 rounded border border-green-500">
              <p className="text-green-300 font-semibold text-center">
                🎉 Tutorial completed! Great job!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Remote Control */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">

        <div className="grid grid-cols-3 gap-3">
          {/* Row 1 */}
          <Button
            color="bg-green-500 hover:bg-green-400 text-white"
            onClick={handleStartStop}
          >
            START STOP
          </Button>
          <Button
            color="bg-yellow-500 hover:bg-yellow-400 text-black"
            onClick={() => { }} // Rearm does nothing
          >
            REARM
          </Button>
          <Button
            color="bg-green-500 hover:bg-green-400 text-white"
            onClick={handlePause}
          >
            PAUSE<br />1 MIN
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
            MISE A<br />ZERO
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
            ariaLabel="left red card"
            ariaPressed={state.leftCards.red}
          >
            CARD<br />ROUGE
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
            ariaLabel="right red card"
            ariaPressed={state.rightCards.red}
          >
            CARD<br />ROUGE
          </Button>

          {/* Row 4 */}
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => handleCard('left', 'yellow')}
            ariaLabel="left yellow card"
            ariaPressed={state.leftCards.yellow}
          >
            CARD<br />JAUNE
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={handleMatchCount}
          >
            MATCH<br />COUNT
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => handleCard('right', 'yellow')}
            ariaLabel="right yellow card"
            ariaPressed={state.rightCards.yellow}
          >
            CARD<br />JAUNE
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
            onClick={handlePriorityManual}
          >
            P<br />MAN
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
            onClick={() => { }} // Block does nothing
          >
            BLOCK
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={handlePriorityRandom}
          >
            P<br />CAS
          </Button>
          <Button
            color="bg-purple-500 hover:bg-purple-400 text-white"
            onClick={() => { }} // Telec acquis does nothing
          >
            TELEC<br />ACQUIS
          </Button>
        </div>

      </div>

      {/* Scoring Display */}
      <div className="bg-black text-white p-8 rounded-lg shadow-2xl min-w-[400px]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">FENCING SCORING</h1>
          <div className="text-4xl font-mono font-bold">
            {formatTime(pauseRemaining ?? state.timeRemaining)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {state.isRunning && !state.isPaused && pauseRemaining === null && (
              <Play className="w-4 h-4 text-green-400" />
            )}
            {state.isPaused && (
              <Pause className="w-4 h-4 text-yellow-400" />
            )}
            {!state.isRunning && pauseRemaining === null && (
              <Square className="w-4 h-4 text-red-400" />
            )}
            <span
              className="text-sm"
              aria-label="status"
            >
              {pauseRemaining !== null
                ? 'PAUSE'
                : state.isRunning
                  ? (state.isPaused ? 'PAUSED' : 'RUNNING')
                  : 'STOPPED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Fencer */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">LEFT</div>
            <div className="text-6xl font-mono font-bold mb-4">{state.leftScore}</div>
            <div className="flex items-center justify-center gap-3">
              <span
                className={`inline-block w-4 text-sm font-bold text-yellow-300 text-center ${state.priority === 'left' ? 'visible' : 'invisible'}`}
                aria-label="priority left"
                aria-hidden={state.priority === 'left' ? 'false' : 'true'}
              >
                P
              </span>
              <div
                className={`w-4 h-4 rounded-full ${state.leftCards.yellow ? 'bg-yellow-400' : 'bg-gray-600'}`}
                aria-label={`left yellow card ${state.leftCards.yellow ? 'on' : 'off'}`}
              ></div>
              <div
                className={`w-4 h-4 rounded-full ${state.leftCards.red ? 'bg-red-500' : 'bg-gray-600'}`}
                aria-label={`left red card ${state.leftCards.red ? 'on' : 'off'}`}
              ></div>
            </div>
          </div>

          {/* Match Count Indicators (Center Column) */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              {[3, 2, 1].map((round) => (
                <div
                  key={round}
                  className={`w-4 h-4 rounded-full ${state.matchCount > 0 && state.matchCount >= round ? 'bg-yellow-300' : 'bg-gray-600'}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Right Fencer */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">RIGHT</div>
            <div className="text-6xl font-mono font-bold mb-4">{state.rightScore}</div>
            <div className="flex items-center justify-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${state.rightCards.yellow ? 'bg-yellow-400' : 'bg-gray-600'}`}
                aria-label={`right yellow card ${state.rightCards.yellow ? 'on' : 'off'}`}
              ></div>
              <div
                className={`w-4 h-4 rounded-full ${state.rightCards.red ? 'bg-red-500' : 'bg-gray-600'}`}
                aria-label={`right red card ${state.rightCards.red ? 'on' : 'off'}`}
              ></div>
              <span
                className={`inline-block w-4 text-sm font-bold text-yellow-300 text-center ${state.priority === 'right' ? 'visible' : 'invisible'}`}
                aria-label="priority right"
                aria-hidden={state.priority === 'right' ? 'false' : 'true'}
              >
                P
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FencingRemote;