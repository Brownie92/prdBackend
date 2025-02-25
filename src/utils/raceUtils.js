export const calculateProgressAndBoost = (memes, boostSummary) => {
    if (!Array.isArray(memes) || memes.length === 0) {
        console.error("[ERROR] ❌ No memes found in race. Cannot calculate progress.");
        return { updatedMemes: [], roundLog: { progress: [], winner: null } };
    }

    const boostRanges = {
        1: [35, 50], 
        2: [15, 25], 
        3: [5, 10]   
    };

    const roundLog = { progress: [], winner: null };

    console.log(`[DEBUG] 🔍 Boost summary ontvangen:`, boostSummary);

    // ✅ Koppel de SOL-boosts aan de juiste memes
    const memesWithBoost = memes.map(meme => {
        const boostData = boostSummary.find(boost => boost._id.toString() === meme.memeId.toString());
        return {
            ...meme,
            memeId: meme.memeId || meme._id?.toString(),  // ✅ Zorg ervoor dat memeId altijd een string is
            totalSol: boostData ? boostData.totalSol : 0  
        };
    });

    // ✅ Sorteer de memes op de totale SOL die is ingezet
    const sortedMemes = [...memesWithBoost].sort((a, b) => b.totalSol - a.totalSol);

    console.log(`[DEBUG] ✅ Memes gesorteerd op boost:`, sortedMemes);

    // ✅ Bereken progressie en pas boosts toe
    const updatedMemes = sortedMemes.map((meme, index) => {
        const baseProgress = Math.floor(Math.random() * 51) + 50;

        let boosted = false;
        let boostAmount = 0;

        // ✅ Pas boosts toe op de top 3 meest gebooste memes
        if (index < 3 && meme.totalSol > 0) {
            boosted = true;
            const [minBoost, maxBoost] = boostRanges[index + 1];
            const boostPercentage = Math.random() * (maxBoost - minBoost) + minBoost;
            boostAmount = Math.floor((boostPercentage / 100) * 100);
        }

        const totalProgress = baseProgress + boostAmount;

        // ✅ Zorg ervoor dat `memeId` correct wordt opgeslagen
        if (!meme.memeId) {
            console.error(`[ERROR] ❌ Meme mist een memeId:`, meme);
        }

        roundLog.progress.push({
            memeId: meme.memeId || "UNKNOWN", // Fallback voor debugging
            progress: totalProgress,
            baseProgress,
            boosted,
            boostAmount
        });

        return {
            ...meme,
            progress: (meme.progress || 0) + totalProgress
        };
    });

    console.log(`[DEBUG] ✅ Nieuwe ronde progress berekend:`, roundLog);

    // ✅ Bepaal de winnaar van deze ronde
    const roundWinner = roundLog.progress.reduce((max, item) =>
        item.progress > max.progress ? item : max, { memeId: null, progress: 0 }
    );
    roundLog.winner = roundWinner.memeId;

    return { updatedMemes, roundLog };
};