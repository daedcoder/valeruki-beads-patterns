export const buildSaveTarget = ({
    openedPatternId,
    openedPatternName,
    requestedName,
    duplicate,
}) => {
    const safeName = (requestedName ?? openedPatternName ?? "").trim();

    return {
        patternId: duplicate ? null : openedPatternId ?? null,
        name: safeName,
    };
};
