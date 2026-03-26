import httpProxy from  'http-proxy';
import http from 'http';

//i have to tell loadbalancers about the available servers
const servers = [
    {host:'localhost', port:3001},
    {host:'localhost', port:3002},
    {host:'localhost', port:3003}
];

//to track the server health
//why - so if server is facing the health issue we don't waste our time onto it 
const serverHealth = {
    3001:true,
    3002:true,
    3003:true
}

const proxy = httpProxy.createProxyServer({});

proxy.on('error' , (err, req, res, target) => {
    console.log(`Server is Down : ${target.port}`);
    serverHealth[target.port] = false;
    res.writeHead(502);
    res.end(`Server is unavalable on ${target.port}`);
})

let currentIndex = 0;

//round robin algo which gives us the server to hit
function roundRobin(){
    //which servers are available for requests
    const healthyServers = servers.filter(s => serverHealth[s.port]);
    console.log("Healthy Servers: ", healthyServers);
    console.log('Request count: ', currentIndex);
    if(healthyServers.length === 0){
        console.log("there is no server is available to take requests...😒😒");
        return null;
    }

    //no of requests ka tracker rkhna pdega
    const serverToHit = healthyServers [currentIndex % healthyServers.length];
    currentIndex++;
    return serverToHit;
}

//creating real loadbalancer server
const loadbalancer  = http.createServer((req, res) => {
    // Health status endpoint
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            servers: servers.map(s => ({
                port: s.port,
                healthy: serverHealth[s.port]
            })),
            totalRequests: currentIndex
        }));
        return;
    }

    const target = roundRobin();

    if(!target){
        console.log('No servers is available right now ...');
        res.writeHead(503);
        res.end('No server available');
        return ;
    }

    console.log(`→ Routing request to port ${target.port}`);

    //forward req to target machine  using proxy server 
    proxy.web(req, res , {
        target:`http://${target.host}:${target.port}`
    });

});

loadbalancer.listen(3000, ()=> {
        console.log('🚀 Load Balancer running on port 3000');
});

//to check the health of servers at regular intervals
function checkServerHealth(){

    servers.forEach(s => {
        const options = {
            host:s.host,
            port : s.port, 
            path:'/',
            timeout:2000
        };

        //it just prepares the request
        const req = http.request(options , (res)=>{
            if(res.statusCode === 200){
                if(!serverHealth[options.port]){
                    console.log(`Server ${options.port} is back online...`);
                }
                serverHealth[options.port] =true;
            }
        });

        req.on('error', ()=>{
            console.log(`Server ${s.port} is down...`);
            serverHealth[s.port] = false;
        });

        //this finally hit the server
        req.end();
    });
}

// Check server health every 5 seconds
setInterval(checkServerHealth, 5000);

//check server health every 5 sec
setInterval(checkServerHealth , 5000);


