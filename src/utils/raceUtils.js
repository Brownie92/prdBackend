export const calculateProgressAndBoost = (memes, boostSummary) => {
    if (!Array.isArray(memes) || memes.length === 0) {
        console.error("[ERROR] ❌ No memes found in race. Cannot calculate progress.");
        return { updatedMemes: [], roundLog: { progress: [], boosts: [], winner: null } };
    }

    const boostRanges = {
        1: [35, 50], 
        2: [15, 25], 
        3: [5, 10]   
    };

    const roundLog = { progress: [], boosts: [], winner: null };

    console.log(`[DEBUG] 🔍 Boost summary ontvangen:`, boostSummary);

    // ✅ Koppel de SOL-boosts aan de juiste memes
    const memesWithBoost = memes.map(meme => {
        const boostData = boostSummary.find(boost => boost._id.toString() === meme.memeId.toString());
        return {
            ...meme,
            memeId: meme.memeId || meme._id?.toString(),
            boostAmount: boostData ? boostData.totalSol : 0  // ✅ Correcte naamgeving (niet `totalSol`)
        };
    });

    // ✅ Sorteer de memes op de boostAmount van deze ronde
    const sortedMemes = [...memesWithBoost].sort((a, b) => b.boostAmount - a.boostAmount);

    console.log(`[DEBUG] ✅ Memes gesorteerd op boostAmount:`, sortedMemes);

    // ✅ Bereken progressie en pas boosts toe
    const updatedMemes = sortedMemes.map((meme, index) => {
        const baseProgress = Math.floor(Math.random() * 51) + 50;

        let boosted = false;
        let boostAmount = 0;

        // ✅ Pas boosts toe op de top 3 meest gebooste memes in **deze ronde**
        if (index < 3 && meme.boostAmount > 0) {
            boosted = true;
            const [minBoost, maxBoost] = boostRanges[index + 1];
            const boostPercentage = Math.random() * (maxBoost - minBoost) + minBoost;
            boostAmount = Math.floor((boostPercentage / 100) * 100);
        }

        // ✅ Debug logs voor basis en boost progressie
        console.log(`[DEBUG] 🏆 Meme: ${meme.name} (ID: ${meme.memeId})`);
        console.log(`       🔹 Base Progress: ${baseProgress}`);
        console.log(`       🔹 Boosted: ${boosted}`);
        console.log(`       🔹 Boost Amount: ${boostAmount}`);
        console.log(`       🔹 Boost Amount deze ronde: ${meme.boostAmount}`);
        console.log(`       ➡️ Final Total Progress: ${baseProgress + boostAmount}`);

        // ✅ Basis progressie apart opslaan
        roundLog.progress.push({
            memeId: meme.memeId || "UNKNOWN",
            progress: baseProgress,
        });

        // ✅ Boost progress apart opslaan
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

    console.log(`[DEBUG] ✅ Nieuwe ronde progress berekend:`, roundLog);

    // ✅ Bepaal de winnaar van deze ronde
    const roundWinner = roundLog.progress.reduce((max, item) =>
        item.progress > max.progress ? item : max, { memeId: null, progress: 0 }
    );
    roundLog.winner = roundWinner.memeId;

    console.log(`[DEBUG] 🏅 Ronde winnaar: ${roundWinner.memeId || "Geen winnaar bepaald"}`);

    return { updatedMemes, roundLog };
};