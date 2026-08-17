import test from "node:test";
import assert from "node:assert/strict";

import {
  createPattern,
  clonePattern,
  commitHistorySnapshot,
  resetHistorySnapshot,
  undoHistory,
  redoHistory,
} from "./patternHistory.js";

test("createPattern builds a matrix with the requested dimensions", () => {
  const pattern = createPattern(2, 3);

  assert.equal(pattern.length, 3);
  assert.equal(pattern[0].length, 2);
  assert.deepEqual(pattern[0], [null, null]);
  assert.deepEqual(pattern[2], [null, null]);
});

test("commitHistorySnapshot adds a new state and keeps the newest snapshot", () => {
  const initial = createPattern(2, 2);
  const history = [{ pattern: clonePattern(initial), width: 2, height: 2 }];

  const result = commitHistorySnapshot(history, 0, [
    [null, "red"],
    ["blue", null],
  ], 2, 2, 30);

  assert.equal(result.index, 1);
  assert.equal(result.history.length, 2);
  assert.deepEqual(result.history[1].pattern, [
    [null, "red"],
    ["blue", null],
  ]);
});

test("undoHistory and redoHistory move through snapshots without breaking bounds", () => {
  const first = createPattern(2, 2);
  const second = [
    ["red", null],
    [null, null],
  ];
  const third = [
    ["red", "blue"],
    [null, null],
  ];

  let history = [
    { pattern: clonePattern(first), width: 2, height: 2 },
    { pattern: clonePattern(second), width: 2, height: 2 },
    { pattern: clonePattern(third), width: 2, height: 2 },
  ];
  let index = 2;

  const undone = undoHistory(history, index);
  assert.equal(undone.index, 1);
  assert.deepEqual(undone.history[1].pattern, second);

  const redone = redoHistory(undone.history, undone.index);
  assert.equal(redone.index, 2);
  assert.deepEqual(redone.history[2].pattern, third);

  const noUndo = undoHistory(redone.history, 0);
  assert.equal(noUndo.index, 0);

  const noRedo = redoHistory(redone.history, redone.history.length - 1);
  assert.equal(noRedo.index, redone.history.length - 1);
});

test("resetHistorySnapshot clears undo/redo history and keeps only the new state", () => {
  const previousHistory = [
    { pattern: [["red", null]], width: 1, height: 1 },
    { pattern: [["blue", "green"]], width: 2, height: 1 },
  ];

  const result = resetHistorySnapshot(previousHistory, [[null, null]], 2, 1);

  assert.deepEqual(result.history, [
    { pattern: [[null, null]], width: 2, height: 1 },
  ]);
  assert.equal(result.index, 0);
  assert.equal(result.history.length, 1);
});
