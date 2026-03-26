import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Track running servers
const runningServers = new Map();

// Available ports for backend servers
const availablePorts = [3001, 3002, 3003, 3004, 3005];

// Get all server statuses
app.get('/api/servers', (req, res) => {
    const servers = availablePorts.map(port => ({
        port,
        status: runningServers.has(port) ? 'running' : 'stopped'
    }));
    res.json(servers);
});

// Start a server
app.post('/api/servers/start', (req, res) => {
    const { port } = req.body;
    
    if (!availablePorts.includes(port)) {
        return res.status(400).json({ error: 'Invalid port' });
    }
    
    if (runningServers.has(port)) {
        return res.status(400).json({ error: 'Server already running' });
    }
    
    try {
        const serverProcess = spawn('node', ['server-instance.js', port], {
            detached: false,
            stdio: 'inherit'
        });
        
        serverProcess.on('error', (error) => {
            console.error(`Failed to start server on port ${port}:`, error);
            runningServers.delete(port);
        });
        
        serverProcess.on('exit', (code) => {
            console.log(`Server on port ${port} exited with code ${code}`);
            runningServers.delete(port);
        });
        
        runningServers.set(port, serverProcess);
        
        res.json({ message: `Server started on port ${port}`, port });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stop a server
app.post('/api/servers/stop', (req, res) => {
    const { port } = req.body;
    
    if (!runningServers.has(port)) {
        return res.status(400).json({ error: 'Server not running' });
    }
    
    try {
        const serverProcess = runningServers.get(port);
        serverProcess.kill();
        runningServers.delete(port);
        
        res.json({ message: `Server stopped on port ${port}`, port });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoint to load balancer
app.use('/api/loadbalancer', async (req, res) => {
    try {
        // Remove the /api/loadbalancer prefix to get the actual path
        const path = req.url.substring(1); // Remove leading /
        const response = await fetch(`http://localhost:3000/${path}`, {
            method: req.method,
            headers: req.headers
        });
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const text = await response.text();
            res.send(text);
        }
    } catch (error) {
        res.status(503).json({ 
            error: 'Load balancer unavailable',
            message: error.message 
        });
    }
});

// Clean up on exit
process.on('SIGINT', () => {
    console.log('\nShutting down all servers...');
    runningServers.forEach((process, port) => {
        console.log(`Stopping server on port ${port}`);
        process.kill();
    });
    process.exit();
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🎮 Management Server running on http://localhost:${PORT}`);
    console.log(`📊 Open your browser to manage the load balancer`);
});
