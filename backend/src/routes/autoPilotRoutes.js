const express = require('express');
const router = express.Router();
const autoPilotService = require('../services/autoPilotService');

// Start auto-pilot mode
router.post('/start', async (req, res) => {
  try {
    const result = await autoPilotService.startAutoPilot();
    
    res.json({
      success: true,
      message: 'Auto-pilot started successfully',
      data: result
    });
  } catch (error) {
    console.error('Failed to start auto-pilot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop auto-pilot mode
router.post('/stop', async (req, res) => {
  try {
    const result = await autoPilotService.stopAutoPilot();
    
    res.json({
      success: true,
      message: 'Auto-pilot stopped successfully',
      data: result
    });
  } catch (error) {
    console.error('Failed to stop auto-pilot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get auto-pilot status
router.get('/status', async (req, res) => {
  try {
    const status = autoPilotService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Failed to get auto-pilot status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute specific task
router.post('/execute', async (req, res) => {
  try {
    const { task } = req.body;
    
    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task description is required'
      });
    }

    const result = await autoPilotService.executeTask(task);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Failed to execute auto-pilot task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add task to queue
router.post('/queue', async (req, res) => {
  try {
    const { task } = req.body;
    
    if (!task) {
      return res.status(400).json({
        success: false,
        error: 'Task description is required'
      });
    }

    autoPilotService.addTask(task);
    
    res.json({
      success: true,
      message: 'Task added to queue'
    });
  } catch (error) {
    console.error('Failed to add task to queue:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process task queue
router.post('/process-queue', async (req, res) => {
  try {
    await autoPilotService.processTaskQueue();
    
    res.json({
      success: true,
      message: 'Task queue processed'
    });
  } catch (error) {
    console.error('Failed to process task queue:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Perform health check
router.post('/health-check', async (req, res) => {
  try {
    const result = await autoPilotService.performHealthCheck();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Failed to perform health check:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auto-fix issues
router.post('/auto-fix', async (req, res) => {
  try {
    const result = await autoPilotService.performAutoFixes();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Failed to auto-fix issues:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add sample content
router.post('/add-content', async (req, res) => {
  try {
    const result = await autoPilotService.autoAddSampleContent();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Failed to add sample content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get system metrics
router.get('/metrics', async (req, res) => {
  try {
    const status = autoPilotService.getStatus();
    
    // Calculate additional metrics
    const metrics = {
      ...status,
      performance: {
        uptime: status.uptime,
        memoryUsage: {
          heap: Math.round(status.memory.heapUsed / 1024 / 1024) + 'MB',
          total: Math.round(status.memory.heapTotal / 1024 / 1024) + 'MB',
          external: Math.round(status.memory.external / 1024 / 1024) + 'MB'
        },
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      autoPilot: {
        isActive: status.isRunning,
        queueLength: status.queueLength,
        lastResults: status.lastResults,
        features: {
          healthMonitoring: true,
          autoFixing: true,
          contentGeneration: true,
          performanceOptimization: true,
          continuousImprovement: true
        }
      }
    };
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Failed to get metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Emergency stop all processes
router.post('/emergency-stop', async (req, res) => {
  try {
    // Stop auto-pilot
    await autoPilotService.stopAutoPilot();
    
    // Clear task queue
    autoPilotService.taskQueue = [];
    
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    res.json({
      success: true,
      message: 'Emergency stop completed - all processes halted'
    });
  } catch (error) {
    console.error('Failed emergency stop:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
