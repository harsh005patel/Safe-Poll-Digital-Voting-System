const handleConfirmVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate first');
      return;
    }

    try {
      setIsSubmitting(true);

      // Encrypt the vote
      const encryptedVote = voteEncryptionService.encryptVote(vote);
      console.log('Encrypted vote:', encryptedVote);

      // Send the encrypted vote to the server
      await API.patch(`/candidates/${selectedCandidate._id}/vote`, {
        encryptedValue: encryptedVote
      });

      toast.success('Vote cast successfully!');
      navigate(`/elections/${id}/results`);
    } catch (error) {
      console.error('Error encrypting vote:', error);
      toast.error('Error casting vote: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }; 