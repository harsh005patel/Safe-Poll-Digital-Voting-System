import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start tally server 1
const server1 = spawn('node', ['services/tallyServer1.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

// Start tally server 2
const server2 = spawn('node', ['services/tallyServer2.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

// Handle server errors
server1.on('error', (err) => {
    console.error('Failed to start tally server 1:', err);
});

server2.on('error', (err) => {
    console.error('Failed to start tally server 2:', err);
});

// Handle process termination
process.on('SIGINT', () => {
    server1.kill();
    server2.kill();
    process.exit();
}); 