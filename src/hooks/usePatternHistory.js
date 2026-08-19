import { useCallback, useRef, useState } from "react";

import {
  clonePattern,
  commitHistorySnapshot,
  createPattern,
  redoHistory,
  resetHistorySnapshot,
  undoHistory,
} from "../utils/patternHistory";
import {
  DEFAULT_PATTERN_HEIGHT,
  DEFAULT_PATTERN_WIDTH,
} from "../utils/patternSize";

const INITIAL_WIDTH = DEFAULT_PATTERN_WIDTH;
const INITIAL_HEIGHT = DEFAULT_PATTERN_HEIGHT;
const MAX_HISTORY = 30;

export const createInitialHistory = () => [{
  pattern: createPattern(INITIAL_WIDTH, INITIAL_HEIGHT),
  width: INITIAL_WIDTH,
  height: INITIAL_HEIGHT,
}];

export const usePatternHistory = (initialPattern = createPattern(INITIAL_WIDTH, INITIAL_HEIGHT), initialWidth = INITIAL_WIDTH, initialHeight = INITIAL_HEIGHT) => {
  const historyRef = useRef([
    {
      pattern: clonePattern(initialPattern),
      width: initialWidth,
      height: initialHeight,
    },
  ]);

  const historyIndexRef = useRef(0);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyRef.current.length - 1;

  const commitHistory = useCallback((nextPattern, nextWidth, nextHeight) => {
    const currentIndex = historyIndexRef.current;
    const { history, index } = commitHistorySnapshot(
      historyRef.current,
      currentIndex,
      nextPattern,
      nextWidth,
      nextHeight,
      MAX_HISTORY
    );

    historyRef.current = history;
    historyIndexRef.current = index;
    setHistoryIndex(index);
  }, []);

  const undo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const { index, snapshot } = undoHistory(historyRef.current, currentIndex);

    if (currentIndex === index) {
      return false;
    }

    historyIndexRef.current = index;
    setHistoryIndex(index);

    if (snapshot) {
      return {
        pattern: snapshot.pattern,
        width: snapshot.width,
        height: snapshot.height,
      };
    }

    return false;
  }, []);

  const redo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const { index, snapshot } = redoHistory(historyRef.current, currentIndex);

    if (currentIndex === index) {
      return false;
    }

    historyIndexRef.current = index;
    setHistoryIndex(index);

    if (snapshot) {
      return {
        pattern: snapshot.pattern,
        width: snapshot.width,
        height: snapshot.height,
      };
    }

    return false;
  }, []);

  const resetHistory = useCallback((nextPattern, nextWidth, nextHeight) => {
    const { history, index } = resetHistorySnapshot(
      historyRef.current,
      nextPattern,
      nextWidth,
      nextHeight
    );

    historyRef.current = history;
    historyIndexRef.current = index;
    setHistoryIndex(index);
  }, []);

  return {
    canUndo,
    canRedo,
    historyIndex,
    historyRef,
    commitHistory,
    undo,
    redo,
    resetHistory,
  };
};
