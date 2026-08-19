import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_PATTERN_HEIGHT,
  clampPatternSize,
  getMaxPatternWidth,
} from "./patternSize.js";

test("getMaxPatternWidth respects the available viewport width", () => {
  globalThis.window = { innerWidth: 1000 };

  const maxWidth = getMaxPatternWidth();

  assert.equal(maxWidth, 83);
});

test("clampPatternSize keeps width and height within safe limits", () => {
  globalThis.window = { innerWidth: 1000 };

  const result = clampPatternSize(999, 999);

  assert.equal(result.width, getMaxPatternWidth());
  assert.equal(result.height, MAX_PATTERN_HEIGHT);
});
