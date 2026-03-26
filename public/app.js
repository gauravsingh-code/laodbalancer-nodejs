// State management
let servers = [];
let requestHistory = [];

// Initialize the dashboard
async function init() {
    await loadServers();
    await updateLoadBalancerStatus();
    
    // Auto-refresh every 3 seconds
    setInterval(async () => {
        await loadServers();
        await updateLoadBalancerStatus();
    }, 3000);
}

// Load server statuses
async function loadServers() {
    try {
        const response = await fetch('/api/servers');
        servers = await response.json();
        renderServers();
    } catch (error) {
        console.error('Failed to load servers:', error);
        showToast('Failed to load server status', 'error');
    }
}

// Render server cards
function renderServers() {
    const container = document.getElementById('servers-container');
    
    container.innerHTML = servers.map(server => `
        <div class="server-card ${server.status}">
            <div class="server-header">
                <span class="server-port">Port ${server.port}</span>
                <span class="server-status ${server.status}">${server.status}</span>
            </div>
            <div class="server-actions">
                <button 
                    class="btn btn-success" 
                    onclick="startServer(${server.port})"
                    ${server.status === 'running' ? 'disabled' : ''}
                >
                    ▶ Start
                </button>
                <button 
                    class="btn btn-danger" 
                    onclick="stopServer(${server.port})"
                    ${server.status === 'stopped' ? 'disabled' : ''}
                >
                    ■ Stop
                </button>
            </div>
        </div>
    `).join('');
    
    // Update running count
    const runningCount = servers.filter(s => s.status === 'running').length;
    document.getElementById('running-count').textContent = runningCount;
}

// Start a server
async function startServer(port) {
    try {
        const response = await fetch('/api/servers/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port })
        });
        
        if (response.ok) {
            showToast(`Server started on port ${port}`, 'success');
            await loadServers();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to start server', 'error');
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        showToast('Failed to start server', 'error');
    }
}

// Stop a server
async function stopServer(port) {
    try {
        const response = await fetch('/api/servers/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ port })
        });
        
        if (response.ok) {
            showToast(`Server stopped on port ${port}`, 'success');
            await loadServers();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to stop server', 'error');
        }
    } catch (error) {
        console.error('Failed to stop server:', error);
        showToast('Failed to stop server', 'error');
    }
}

// Update load balancer status
async function updateLoadBalancerStatus() {
    try {
        const response = await fetch('/api/loadbalancer/health');
        
        if (response.ok) {
            const data = await response.json();
            
            // Update healthy count
            const healthyCount = data.servers.filter(s => s.healthy).length;
            document.getElementById('healthy-count').textContent = healthyCount;
            document.getElementById('request-count').textContent = data.totalRequests;
            
            // Render health status
            const healthContainer = document.getElementById('health-status');
            healthContainer.innerHTML = data.servers.map(server => `
                <div class="health-item">
                    <div style="display: flex; align-items: center;">
                        <div class="health-indicator ${server.healthy ? 'healthy' : 'unhealthy'}"></div>
                        <span>Port ${server.port}</span>
                    </div>
                    <span style="color: ${server.healthy ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ${server.healthy ? '✓ Healthy' : '✗ Down'}
                    </span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to get load balancer status:', error);
        document.getElementById('healthy-count').textContent = '-';
        document.getElementById('health-status').innerHTML = `
            <div style="text-align: center; padding: 1rem; color: var(--text-secondary);">
                <p>⚠️ Load balancer is not running</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                    Start it with: <code>node loadbalancer.js</code>
                </p>
            </div>
        `;
    }
}

// Send a single request to load balancer
async function sendRequest() {
    try {
        const startTime = Date.now();
        const response = await fetch('/api/loadbalancer/api/data');
        const duration = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            addResponseToHistory({
                success: true,
                server: data.server,
                message: data.message,
                timestamp: data.timestamp,
                duration
            });
            await updateLoadBalancerStatus();
        } else {
            const error = await response.text();
            addResponseToHistory({
                success: false,
                error,
                duration
            });
        }
    } catch (error) {
        addResponseToHistory({
            success: false,
            error: error.message,
            duration: 0
        });
    }
}

// Send multiple requests
async function sendMultipleRequests() {
    const count = 10;
    showToast(`Sending ${count} requests...`, 'success');
    
    for (let i = 0; i < count; i++) {
        await sendRequest();
        // Small delay to see the distribution
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    showToast(`Completed ${count} requests`, 'success');
}

// Add response to history
function addResponseToHistory(response) {
    requestHistory.unshift(response);
    
    // Keep only last 50 requests
    if (requestHistory.length > 50) {
        requestHistory = requestHistory.slice(0, 50);
    }
    
    renderResponses();
}

// Render response history
function renderResponses() {
    const container = document.getElementById('response-container');
    
    if (requestHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No requests sent yet. Click "Send Request" to start!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requestHistory.map((response, index) => {
        const time = new Date().toLocaleTimeString();
        
        if (response.success) {
            return `
                <div class="response-item success">
                    <div class="response-header">
                        <span class="response-time">⏱️ ${time} (${response.duration}ms)</span>
                        <span class="response-server">Port ${response.server}</span>
                    </div>
                    <div class="response-body">
                        ${JSON.stringify({
                            server: response.server,
                            message: response.message,
                            timestamp: response.timestamp
                        }, null, 2)}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="response-item error">
                    <div class="response-header">
                        <span class="response-time">⏱️ ${time}</span>
                        <span class="response-server" style="background: var(--danger-color);">Error</span>
                    </div>
                    <div class="response-body">
                        ❌ ${response.error}
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Clear response history
function clearResponses() {
    requestHistory = [];
    renderResponses();
    showToast('Response history cleared', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize on page load
init();
