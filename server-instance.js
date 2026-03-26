import express from 'express';

const port = process.argv[2] || 3001;

const app = express();

app.get('/', (req, res) => {
    res.send(`
        <h1>Response from Server : ${port}</h1>
        <p>Time : ${new Date().toISOString()}</p>
    `);
});

app.get('/api/data', (req, res) => {
    res.json({
        server: port,
        message: `Hello from Server : ${port}`,
        timestamp: new Date().toISOString(),
    });
    console.log(`✅ Request handled by server: ${port}`);
});

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log(`Server on port ${port} shutting down...`);
    process.exit(0);
});
