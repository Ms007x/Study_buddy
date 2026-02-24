#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to kill processes using a specific port
function killProcessesOnPort(port) {
  return new Promise((resolve, reject) => {
    console.log(`Checking for processes on port ${port}...`);
    
    // Find processes using the port
    exec(`lsof -ti:${port}`, (error, stdout, stderr) => {
      if (error || !stdout.trim()) {
        // No processes found on this port
        resolve();
        return;
      }
      
      const pids = stdout.trim().split('\n');
      console.log(`Found ${pids.length} process(es) on port ${port}: ${pids.join(', ')}`);
      
      // Kill each process
      const killPromises = pids.map(pid => {
        return new Promise((killResolve) => {
          exec(`kill -9 ${pid}`, (killError) => {
            if (killError) {
              console.log(`Failed to kill process ${pid}: ${killError.message}`);
            } else {
              console.log(`Killed process ${pid} on port ${port}`);
            }
            killResolve();
          });
        });
      });
      
      Promise.all(killPromises).then(() => {
        // Wait a moment for processes to fully terminate
        setTimeout(resolve, 1000);
      });
    });
  });
}

// Function to find available port for backend
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      if (startPort < 3010) {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(new Error('No available ports found'));
      }
    });
  });
}

// Function to update vite config with backend port
function updateViteConfig(backendPort) {
  const viteConfigPath = path.join(__dirname, '../vite.config.js');
  let configContent = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Replace the target port in the proxy configuration
  const targetRegex = /target:\s*['"]http:\/\/localhost:\d+['"]/;
  const newTarget = `target: 'http://localhost:${backendPort}'`;
  
  configContent = configContent.replace(targetRegex, newTarget);
  
  fs.writeFileSync(viteConfigPath, configContent);
  console.log(`Updated Vite proxy to use backend port ${backendPort}`);
}

// Main function to start both servers
async function startDevServers() {
  try {
    console.log('🚀 Starting StudyBuddy development servers...');
    
    // Kill processes on default ports first
    console.log('\n📋 Cleaning up default ports...');
    await killProcessesOnPort(3000); // Backend default port
    await killProcessesOnPort(5175); // Frontend default port
    
    // Find available port for backend
    console.log('\n🔍 Finding available ports...');
    const backendPort = await findAvailablePort(3000);
    console.log(`✅ Backend will use port ${backendPort}`);
    
    // Update Vite config with backend port
    updateViteConfig(backendPort);
    
    // Start backend server
    console.log('\n🔧 Starting backend server...');
    const backend = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '../backend'),
      stdio: 'inherit'
    });
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start frontend server
    console.log('🎨 Starting frontend server...');
    const frontend = spawn('npm', ['run', 'dev:frontend'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    console.log('\n✅ Development servers started successfully!');
    console.log(`📍 Backend: http://localhost:${backendPort}`);
    console.log('📍 Frontend: http://localhost:5175 (or next available port)');
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down servers...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start development servers:', error);
    process.exit(1);
  }
}

startDevServers();
