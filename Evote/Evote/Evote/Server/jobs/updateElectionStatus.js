import cron from 'node-cron';
import Election from '../models/election.model.js';

// Update election status every minute
cron.schedule('* * * * *', async () => {
    try {
        await Election.updateActiveStatus();
        console.log('Election status updated successfully');
    } catch (error) {
        console.error('Error updating election status:', error);
    }
});

export default cron; 