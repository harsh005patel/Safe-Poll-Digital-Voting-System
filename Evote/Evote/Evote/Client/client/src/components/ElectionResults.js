const processElectionResults = async () => {
    try {
        console.log('Processing election results...');
        
        // Process each candidate's votes separately
        const updatedCandidates = await Promise.all(candidates.map(async (candidate) => {
            if (!candidate.combinedVotes) {
                return { ...candidate, result: "No votes", total_votes: 0 };
            }

            const tallyResult = await voteEncryptionService.getTallyResults(candidate.combinedVotes, candidates);
            console.log('Tally result for candidate:', candidate.fullname, tallyResult);

            return {
                ...candidate,
                result: tallyResult.result,
                d: tallyResult.d,
                total_votes: tallyResult.total_votes
            };
        }));

        // Sort candidates by total votes
        const sortedCandidates = [...updatedCandidates].sort((a, b) => b.total_votes - a.total_votes);
        setCandidates(sortedCandidates);
    } catch (error) {
        console.error('Error processing election results:', error);
    }
}; 