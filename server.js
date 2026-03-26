import express from 'express';

function createServer(port){
    const app = express();

    app.get('/' , (req,res) => {
        res.send(`
                <h1>Response from Server : ${port}</h1>
                <p>Time : ${new Date().toISOString()}</p>
        `);
    });

    app.get('/api/data' , (req, res) => {
        res.json({
            server : port,
            message : `Hello from Server : ${port}`,
            timestamp : new Date().toISOString(),
        })
        console.log(`Response from server: ${port} : `);
        console.log("--Response---", res);
    });

    app.listen(port , ()=>{
        console.log(`✅ Server running on port ${port}`);
    })
};

//creating 3 servers
createServer(3001);
// createServer(3002);
createServer(3003);

