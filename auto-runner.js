const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoRunner {
  constructor() {
    this.commands = [];
    this.running = false;
  }

  // Add command to queue
  addCommand(command, description, cwd = null) {
    this.commands.push({ command, description, cwd });
  }

  // Execute all commands automatically
  async executeAll() {
    if (this.running) return;
    this.running = true;

    console.log('🚀 Auto-Runner: Starting automated execution...');

    for (const cmd of this.commands) {
      await this.executeCommand(cmd);
    }

    console.log('✅ Auto-Runner: All commands completed!');
    this.running = false;
  }

  // Execute single command with auto-error handling
  async executeCommand({ command, description, cwd }) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Executing: ${description}`);
      console.log(`💻 Command: ${command}`);

      const child = spawn(command, [], {
        shell: true,
        cwd: cwd || process.cwd(),
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`📤 Output: ${data.toString().trim()}`);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log(`⚠️  Error: ${data.toString().trim()}`);
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Success: ${description}`);
          resolve({ success: true, stdout, stderr });
        } else {
          console.log(`❌ Failed: ${description} (Exit code: ${code})`);
          // Auto-diagnose and fix common errors
          this.diagnoseAndFix(command, description, stderr);
          resolve({ success: false, stdout, stderr, exitCode: code });
        }
      });

      child.on('error', (error) => {
        console.log(`💥 Error: ${description} - ${error.message}`);
        this.diagnoseAndFix(command, description, error.message);
        resolve({ success: false, error: error.message });
      });
    });
  }

  // Auto-diagnose and fix common errors
  async diagnoseAndFix(command, description, error) {
    console.log(`🔍 Auto-diagnosing: ${description}`);

    // Common fixes
    if (error.includes('Port 5001 is already in use')) {
      console.log('🔧 Auto-fix: Killing existing node processes...');
      await this.executeCommand({
        command: 'taskkill /F /IM node.exe',
        description: 'Kill existing Node.js processes'
      });
      
      // Retry the original command after 2 seconds
      setTimeout(async () => {
        console.log('🔄 Retrying original command...');
        await this.executeCommand({ command, description });
      }, 2000);
    }

    if (error.includes('npm error Missing script: "start"')) {
      console.log('🔧 Auto-fix: Using correct npm command...');
      const fixedCommand = command.replace('npm start', 'npm run dev');
      await this.executeCommand({
        command: fixedCommand,
        description: description + ' (fixed)'
      });
    }

    if (error.includes('MODULE_NOT_FOUND')) {
      console.log('🔧 Auto-fix: Installing missing dependencies...');
      await this.executeCommand({
        command: 'npm install',
        description: 'Install dependencies',
        cwd: path.dirname(command.split(' ')[1])
      });
    }

    if (error.includes('Access denied') || error.includes('EACCES')) {
      console.log('🔧 Auto-fix: Running with elevated privileges...');
      const elevatedCommand = `powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb RunAs"`;
      await this.executeCommand({
        command: elevatedCommand,
        description: description + ' (elevated)'
      });
    }
  }

  // Quick development environment setup
  async setupDevEnvironment() {
    this.addCommand('taskkill /F /IM node.exe', 'Clean up existing processes');
    this.addCommand('cd backend && npm start', 'Start backend server', path.join(__dirname, 'backend'));
    this.addCommand('cd frontend && npm run dev', 'Start frontend server', path.join(__dirname, 'frontend'));
    
    await this.executeAll();
  }

  // Quick fix for common issues
  async quickFix() {
    this.addCommand('npm install', 'Install dependencies');
    this.addCommand('npm audit fix', 'Fix security vulnerabilities');
    this.addCommand('npm cache clean --force', 'Clean npm cache');
    
    await this.executeAll();
  }
}

// Export for use
module.exports = AutoRunner;

// Auto-run if called directly
if (require.main === module) {
  const runner = new AutoRunner();
  
  // Setup development environment
  runner.setupDevEnvironment().catch(console.error);
}
