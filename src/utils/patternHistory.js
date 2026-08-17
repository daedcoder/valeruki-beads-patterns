export const createPattern = (width, height) =>
  Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null)
  );

export const clonePattern = (pattern) =>
  pattern.map((row) => [...row]);

export const commitHistorySnapshot = (
  history,
  currentIndex,
  nextPattern,
  nextWidth,
  nextHeight,
  maxHistory = 30
) => {
  const trimmedHistory = history.slice(0, currentIndex + 1);
  const snapshot = {
    pattern: clonePattern(nextPattern),
    width: nextWidth,
    height: nextHeight,
  };

  const withSnapshot = [...trimmedHistory, snapshot];
  const nextHistory =
    withSnapshot.length > maxHistory
      ? withSnapshot.slice(withSnapshot.length - maxHistory)
      : withSnapshot;

  return {
    history: nextHistory,
    index: nextHistory.length - 1,
  };
};

export const resetHistorySnapshot = (
  history,
  nextPattern,
  nextWidth,
  nextHeight
) => {
  const cleanHistory = [{
    pattern: clonePattern(nextPattern),
    width: nextWidth,
    height: nextHeight,
  }];

  return {
    history: cleanHistory,
    index: 0,
  };
};

export const undoHistory = (history, currentIndex) => {
  if (currentIndex <= 0) {
    return {
      history,
      index: 0,
    };
  }

  const nextIndex = currentIndex - 1;

  return {
    history,
    index: nextIndex,
    snapshot: history[nextIndex],
  };
};

export const redoHistory = (history, currentIndex) => {
  if (currentIndex >= history.length - 1) {
    return {
      history,
      index: currentIndex,
    };
  }

  const nextIndex = currentIndex + 1;

  return {
    history,
    index: nextIndex,
    snapshot: history[nextIndex],
  };
};
