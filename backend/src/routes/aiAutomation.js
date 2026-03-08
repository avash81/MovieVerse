const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const fs = require('fs').promises;
const path = require('path');

// Analyze code for errors and improvements
router.post('/analyze-code', async (req, res) => {
  try {
    const { code, context } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const analysis = await geminiService.analyzeCode(code, context);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Code Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fix specific error in code
router.post('/fix-error', async (req, res) => {
  try {
    const { error, code } = req.body;
    
    if (!error || !code) {
      return res.status(400).json({ error: 'Error and code are required' });
    }

    const fixedCode = await geminiService.generateFix(error, code);
    res.json({ success: true, fixedCode });
  } catch (error) {
    console.error('Error Fix Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Optimize code
router.post('/optimize-code', async (req, res) => {
  try {
    const { code, optimizationType = 'performance' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const optimizedCode = await geminiService.optimizeCode(code, optimizationType);
    res.json({ success: true, optimizedCode });
  } catch (error) {
    console.error('Code Optimization Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze entire file
router.post('/analyze-file', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    // Security check - only allow certain directories
    const allowedPaths = [
      'c:\\Users\\hp\\Desktop\\Movie\\MovieVerse\\backend',
      'c:\\Users\\hp\\Desktop\\Movie\\MovieVerse\\frontend'
    ];

    const isAllowed = allowedPaths.some(allowedPath => 
      filePath.startsWith(allowedPath)
    );

    if (!isAllowed) {
      return res.status(403).json({ error: 'Access to this file is not allowed' });
    }

    const analysis = await geminiService.analyzeFile(filePath);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('File Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate tests for code
router.post('/generate-tests', async (req, res) => {
  try {
    const { code, testFramework = 'jest' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const tests = await geminiService.generateTests(code, testFramework);
    res.json({ success: true, tests });
  } catch (error) {
    console.error('Test Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Refactor code
router.post('/refactor-code', async (req, res) => {
  try {
    const { code, refactorType = 'clean-code' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const refactoredCode = await geminiService.refactorCode(code, refactorType);
    res.json({ success: true, refactoredCode });
  } catch (error) {
    console.error('Code Refactoring Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get project structure for analysis
router.get('/project-structure', async (req, res) => {
  try {
    const projectPath = 'c:\\Users\\hp\\Desktop\\Movie\\MovieVerse';
    const structure = await getDirectoryStructure(projectPath);
    res.json({ success: true, structure });
  } catch (error) {
    console.error('Project Structure Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch analyze multiple files
router.post('/batch-analyze', async (req, res) => {
  try {
    const { filePaths } = req.body;
    
    if (!filePaths || !Array.isArray(filePaths)) {
      return res.status(400).json({ error: 'File paths array is required' });
    }

    const results = [];
    for (const filePath of filePaths) {
      try {
        const analysis = await geminiService.analyzeFile(filePath);
        results.push({ filePath, analysis, success: true });
      } catch (error) {
        results.push({ filePath, error: error.message, success: false });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Batch Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get directory structure
async function getDirectoryStructure(dirPath, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return null;

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const structure = {};

    for (const item of items) {
      if (item.name.startsWith('.') || item.name === 'node_modules') continue;

      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        const subStructure = await getDirectoryStructure(fullPath, maxDepth, currentDepth + 1);
        if (subStructure) {
          structure[item.name] = subStructure;
        }
      } else {
        structure[item.name] = {
          type: 'file',
          path: fullPath,
          size: (await fs.stat(fullPath)).size
        };
      }
    }

    return structure;
  } catch (error) {
    console.error('Directory Structure Error:', error);
    return null;
  }
}

module.exports = router;
