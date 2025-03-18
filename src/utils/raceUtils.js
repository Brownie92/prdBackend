export const calculateProgressAndBoost = (memes, boostSummary) => {
    if (!Array.isArray(memes) || memes.length === 0) {
        console.error("[ERROR] No memes found in race. Cannot calculate progress.");
        return { updatedMemes: [], roundLog: { progress: [], boosts: [], winner: null } };
    }

    const boostRanges = {
        1: [35, 50], 
        2: [15, 25], 
        3: [5, 10]   
    };

    const roundLog = { progress: [], boosts: [], winner: null };

    // Received boost summary
    const memesWithBoost = memes.map(meme => {
        const boostData = boostSummary.find(boost => boost._id.toString() === meme.memeId.toString());
        return {
            ...meme,
            memeId: meme.memeId || meme._id?.toString(),
            boostAmount: boostData ? boostData.totalSol : 0  // Correct naming (not `totalSol`)
        };
    });

    // Sort memes by boostAmount for this round
    const sortedMemes = [...memesWithBoost].sort((a, b) => b.boostAmount - a.boostAmount);

    // Apply boosts to the top 3 most boosted memes in this round
    const updatedMemes = sortedMemes.map((meme, index) => {
        const baseProgress = Math.floor(Math.random() * 51) + 50;

        let boosted = false;
        let boostAmount = 0;

        if (index < 3 && meme.boostAmount > 0) {
            boosted = true;
            const [minBoost, maxBoost] = boostRanges[index + 1];
            const boostPercentage = Math.random() * (maxBoost - minBoost) + minBoost;
            boostAmount = Math.floor((boostPercentage / 100) * 100);
        }

        // Debug logs for base and boost progression
        roundLog.progress.push({
            memeId: meme.memeId || "UNKNOWN",
            progress: baseProgress,
        });

        roundLog.boosts.push({
            memeId: meme.memeId || "UNKNOWN",
            boostAmount,
            boosted
        });

        return {
            ...meme,
            progress: (meme.progress || 0) + baseProgress + boostAmount
        };
    });

    // Determine the winner of this round
    const roundWinner = roundLog.progress.reduce((max, item) =>
        item.progress > max.progress ? item : max, { memeId: null, progress: 0 }
    );
    roundLog.winner = roundWinner.memeId;

    return { updatedMemes, roundLog };
};