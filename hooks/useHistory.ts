import { useState, useCallback } from 'react';

export const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];
  
  const setState = useCallback((value: T | ((prevState: T) => T)) => {
    const newState = typeof value === 'function' 
        ? (value as (prevState: T) => T)(state) 
        : value;

    // When a new state is set after an undo, we need to discard the "future" history.
    const newHistory = [...history.slice(0, currentIndex + 1), newState];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [currentIndex, history, state]);
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);
  
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
