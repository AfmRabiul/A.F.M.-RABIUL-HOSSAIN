import React from 'react';
import { PhotoIcon, RefreshIcon, UndoIcon, RedoIcon } from './Icons';

interface HeaderProps {
  onReset?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, onUndo, onRedo, canUndo, canRedo }) => {
  const buttonClass = "bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center transition-colors duration-200";
  const disabledButtonClass = "disabled:opacity-40 disabled:cursor-not-allowed";
  const hoverButtonClass = "hover:bg-gray-600";

  return (
    <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center">
        <PhotoIcon className="h-8 w-8 text-indigo-400 mr-3" />
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
          Lumina AI
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {onReset && (
          <>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`${buttonClass} ${hoverButtonClass} ${disabledButtonClass}`}
              aria-label="Undo last action"
            >
              <UndoIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`${buttonClass} ${hoverButtonClass} ${disabledButtonClass}`}
              aria-label="Redo last action"
            >
              <RedoIcon className="h-5 w-5" />
            </button>
             <div className="w-px h-6 bg-gray-600 mx-1"></div>
          </>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className={`${buttonClass} ${hoverButtonClass}`}
            aria-label="Start over"
          >
            <RefreshIcon className="h-5 w-5 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
