import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to start a tally server
const startServer = (serverNumber, port) => {
    const serverPath = path.join('services', `tallyServer${serverNumber}.js`);
    const server = spawn('node', [serverPath], {
        stdio: 'inherit',
        shell: true
    });

    server.on('error', (error) => {
        console.error(`Error starting server ${serverNumber}:`, error);
    });

    return server;
};

// Start all three servers
console.log('Starting tally servers...');

const server1 = startServer(1, 5001);
const server2 = startServer(2, 5002);
const server3 = startServer(3, 5003);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down tally servers...');
    server1.kill();
    server2.kill();
    server3.kill();
    process.exit();
}); 