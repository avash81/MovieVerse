const express = require('express');
const router = express.Router();
const automationService = require('../services/automationService');

// Execute a task automatically
router.post('/execute', async (req, res) => {
  try {
    const { task } = req.body;
    
    if (!task || typeof task !== 'string') {
      return res.status(400).json({ 
        error: 'Task description is required and must be a string' 
      });
    }

    console.log(`🤖 Executing automated task: ${task}`);
    
    const result = await automationService.executeTask(task);
    
    console.log(`✅ Task completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    
    res.json({
      success: true,
      taskId: result.taskId,
      result: result
    });
  } catch (error) {
    console.error('❌ Automation error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Automation service encountered an error'
    });
  }
});

// Get task status
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskStatus = automationService.getTaskStatus(taskId);
    
    if (!taskStatus) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      success: true,
      task: taskStatus
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all task history
router.get('/history', async (req, res) => {
  try {
    const history = automationService.getTaskHistory();
    
    res.json({
      success: true,
      history: history,
      total: history.length
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Quick fix common issues
router.post('/quick-fix', async (req, res) => {
  try {
    const { issue } = req.body;
    
    if (!issue) {
      return res.status(400).json({ error: 'Issue description is required' });
    }

    const commonFixes = {
      'npm install': 'npm install',
      'dependencies': 'npm install && npm audit fix',
      'build error': 'npm run clean && npm run build',
      'port error': 'netstat -ano | findstr :5001',
      'permission': 'chmod +x scripts/*',
      'import error': 'npm install missing-dependency',
      'cors': 'npm install cors',
      'env': 'cp .env.example .env'
    };

    let fixCommand = commonFixes[issue.toLowerCase()] || 'npm run dev';
    
    const result = await automationService.executeTask(`Fix: ${issue}`);
    
    res.json({
      success: true,
      fix: fixCommand,
      result: result
    });
  } catch (error) {
    console.error('Quick fix error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-detect and fix issues
router.post('/auto-fix', async (req, res) => {
  try {
    const result = await automationService.executeTask('Scan project for issues and fix them automatically');
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Auto-fix error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Install missing dependencies
router.post('/install-deps', async (req, res) => {
  try {
    const result = await automationService.executeTask('Check and install all missing dependencies');
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Dependency install error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Run project health check
router.get('/health-check', async (req, res) => {
  try {
    const result = await automationService.executeTask('Perform comprehensive project health check');
    
    res.json({
      success: true,
      health: result
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
