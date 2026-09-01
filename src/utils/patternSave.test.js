import test from "node:test";
import assert from "node:assert/strict";

import { buildSaveTarget } from "./patternSave.js";

test("buildSaveTarget keeps the current record when not duplicating", () => {
  const result = buildSaveTarget({
    openedPatternId: 42,
    openedPatternName: "Mi diseño",
    requestedName: "Otro nombre",
    duplicate: false,
  });

  assert.deepEqual(result, {
    patternId: 42,
    name: "Otro nombre",
  });
});

test("buildSaveTarget creates a new record when duplicating", () => {
  const result = buildSaveTarget({
    openedPatternId: 42,
    openedPatternName: "Mi diseño",
    requestedName: "Mi diseño copia",
    duplicate: true,
  });

  assert.deepEqual(result, {
    patternId: null,
    name: "Mi diseño copia",
  });
});
