export const MAX_PATTERN_WIDTH = 115;
export const MAX_PATTERN_HEIGHT = 64;
export const DEFAULT_PATTERN_WIDTH = 80;
export const DEFAULT_PATTERN_HEIGHT = 45;

export const clampPatternSize = (width, height) => {
  const safeWidth = Number.isFinite(width)
    ? Math.max(1, Math.min(Math.round(width), MAX_PATTERN_WIDTH))
    : DEFAULT_PATTERN_WIDTH;

  const safeHeight = Number.isFinite(height)
    ? Math.max(1, Math.min(Math.round(height), MAX_PATTERN_HEIGHT))
    : DEFAULT_PATTERN_HEIGHT;

  return {
    width: safeWidth,
    height: safeHeight,
  };
};
