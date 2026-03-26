# 🚀 Load Balancer Dashboard

A modern, web-based load balancer management system with a professional UI for managing backend servers and testing load distribution.

## 📋 Features

- **Server Management**: Start and stop backend servers with a single click
- **Real-time Status**: Live monitoring of server health and load balancer stats
- **Request Testing**: Send single or multiple requests to test load balancing
- **Response History**: View detailed response logs with timestamps and server info
- **Modern UI**: Professional, dark-themed interface with smooth animations
- **Auto-refresh**: Dashboard updates automatically every 3 seconds

## 🏗️ Architecture

- **Load Balancer** (Port 3000): Distributes requests across available backend servers using round-robin algorithm
- **Management Server** (Port 4000): Provides web interface and API for server management
- **Backend Servers** (Ports 3001-3005): Multiple Express servers that handle actual requests

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the System

You need to run **TWO** processes:

#### Terminal 1: Start the Load Balancer
```bash
npm run loadbalancer
```
or
```bash
node loadbalancer.js
```

#### Terminal 2: Start the Management Dashboard
```bash
npm start
```
or
```bash
node management-server.js
```

### Access the Dashboard

Open your browser and navigate to:
```
http://localhost:4000
```

## 🎮 How to Use

### 1. Start Backend Servers
- Look at the "Server Management" section
- Click the **▶ Start** button on any server card (Ports 3001-3005)
- The server card will turn green when running
- You can start multiple servers to see load balancing in action

### 2. Monitor Health Status
- The "Load Balancer Status" section shows:
  - Number of running servers
  - Number of healthy servers
  - Total requests processed
- Each server's health is indicated with a color-coded indicator

### 3. Test Load Balancing
- Click **Send Request** to send a single request
- Click **Send 10 Requests** to send multiple requests and see distribution
- Watch the response history to see which server handled each request
- The load balancer will distribute requests evenly across healthy servers

### 4. Stop Servers
- Click the **■ Stop** button on any running server
- Watch how the load balancer automatically routes around unavailable servers
- The health status will update to show the server is down

## 📁 Project Structure

```
load-balancer/
├── public/
│   ├── index.html          # Dashboard UI
│   ├── styles.css          # Modern styling
│   └── app.js              # Frontend logic
├── loadbalancer.js         # Load balancer implementation
├── management-server.js    # Management API server
├── server-instance.js      # Backend server template
├── server.js               # Legacy server file
├── index.js                # Legacy index file
└── package.json            # Project dependencies
```

## 🔧 API Endpoints

### Management Server (Port 4000)
- `GET /api/servers` - Get all server statuses
- `POST /api/servers/start` - Start a server
- `POST /api/servers/stop` - Stop a server
- `ALL /api/loadbalancer/*` - Proxy to load balancer

### Load Balancer (Port 3000)
- `GET /health` - Get load balancer health status
- `GET /api/data` - Test endpoint (gets load balanced)
- Any other route - Gets load balanced to backend servers

## 💡 Tips

1. **Start with 2-3 servers**: This gives you a good visualization of load balancing
2. **Send 10 requests**: Click "Send 10 Requests" to see round-robin distribution
3. **Stop a server mid-test**: Watch how the load balancer adapts in real-time
4. **Monitor the stats**: The total requests counter shows how many requests have been processed
5. **Check the console**: Both terminals show detailed logging of what's happening

## 🎨 UI Features

- **Dark Mode**: Easy on the eyes with a beautiful gradient background
- **Color Coding**: 
  - Green = Running/Healthy
  - Red = Stopped/Unhealthy
  - Blue = Primary actions
  - Purple = Secondary actions
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Works on desktop and mobile devices
- **Toast Notifications**: Visual feedback for all actions

## 🐛 Troubleshooting

### Load balancer shows as "not running"
- Make sure you started the load balancer in a separate terminal
- Check that port 3000 is not already in use

### Can't start a server
- The server may already be running
- Check that the port is not already in use
- Look at the terminal logs for error messages

### No responses when sending requests
- Make sure at least one backend server is running (green card)
- Check that the load balancer is running
- Verify no firewall is blocking local connections

## 📝 Notes

- The dashboard auto-refreshes every 3 seconds
- Response history is limited to the last 50 requests
- Server health checks run every 5 seconds
- All servers must be stopped manually when shutting down

## 🛠️ Development

To modify the frontend:
1. Edit files in the `public/` folder
2. Refresh your browser (no build step needed)

To modify the backend:
1. Edit `loadbalancer.js` or `management-server.js`
2. Restart the respective process

---

Built with ❤️ using Node.js, Express, and vanilla JavaScript
