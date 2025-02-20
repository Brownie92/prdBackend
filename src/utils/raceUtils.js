export const calculateProgressAndBoost = (memes) => {
    if (!Array.isArray(memes) || memes.length === 0) {
        console.error("[ERROR] ❌ No memes found in race. Cannot calculate progress.");
        return { updatedMemes: [], roundLog: { progress: [], winner: null } };
    }

    // ✅ 1️⃣ Define boost percentages for the top 3 memes
    const boostRanges = {
        1: [35, 50], // 🥇 Rank 1 gets a 35% - 50% boost
        2: [15, 25], // 🥈 Rank 2 gets a 15% - 25% boost
        3: [5, 10]   // 🥉 Rank 3 gets a 5% - 10% boost
    };

    const roundLog = {
        progress: [],
        winner: null
    };

    // ✅ 2️⃣ Sort memes based on the total SOL boosted (highest first)
    const sortedMemes = [...memes].sort((a, b) => (b.totalSol || 0) - (a.totalSol || 0));

    const updatedMemes = sortedMemes.map((meme, index) => {
        // ✅ Random base progress (50 - 100)
        const baseProgress = Math.floor(Math.random() * 51) + 50;

        let boosted = false;
        let boostAmount = 0;

        // ✅ 3️⃣ Only the top 3 memes receive a boost
        if (index < 3 && (meme.totalSol || 0) > 0) {
            boosted = true;
            const [minBoost, maxBoost] = boostRanges[index + 1]; // Get correct boost range
            const boostPercentage = Math.random() * (maxBoost - minBoost) + minBoost;
            boostAmount = Math.floor((boostPercentage / 100) * 100); // Boost based on 100 points
        }

        const totalProgress = baseProgress + boostAmount;

        // ✅ 4️⃣ Log round progress per meme
        roundLog.progress.push({
            memeId: meme.memeId,
            progress: totalProgress,
            baseProgress,
            boosted,
            boostAmount
        });

        return {
            ...meme,
            progress: (meme.progress || 0) + totalProgress // ✅ Ensures progress is never undefined
        };
    });

    // ✅ 5️⃣ Determine the round winner (highest progress)
    const roundWinner = roundLog.progress.reduce((max, item) =>
        item.progress > max.progress ? item : max, { memeId: null, progress: 0 }
    );
    roundLog.winner = roundWinner.memeId;

    return { updatedMemes, roundLog };
};