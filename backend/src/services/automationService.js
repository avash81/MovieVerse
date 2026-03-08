const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const geminiService = require('./geminiService');

class AutomationService {
  constructor() {
    this.taskHistory = [];
    this.projectRoot = 'c:\\Users\\hp\\Desktop\\Movie\\MovieVerse';
  }

  async executeTask(taskDescription) {
    const taskId = Date.now().toString();
    const task = {
      id: taskId,
      description: taskDescription,
      status: 'executing',
      startTime: new Date(),
      steps: []
    };

    this.taskHistory.push(task);

    try {
      // Parse the task using AI to understand what needs to be done
      const parsedTask = await this.parseTask(taskDescription);
      
      // Execute the parsed task
      const result = await this.executeParsedTask(parsedTask, task);
      
      task.status = 'completed';
      task.endTime = new Date();
      task.result = result;
      
      return { success: true, taskId, result };
    } catch (error) {
      task.status = 'failed';
      task.endTime = new Date();
      task.error = error.message;
      
      // Try to fix the error automatically
      const fixResult = await this.attemptErrorFix(error, task);
      
      return { 
        success: false, 
        taskId, 
        error: error.message,
        fixAttempted: fixResult.success,
        fixResult: fixResult.result
      };
    }
  }

  async parseTask(taskDescription) {
    const prompt = `
      You are an expert developer assistant. Parse the following task and break it down into executable steps:
      
      Task: "${taskDescription}"
      
      Provide a JSON response with:
      {
        "type": "feature|bug_fix|optimization|refactor|test|config|other",
        "priority": "high|medium|low",
        "files": ["array of file paths to modify"],
        "operations": [
          {
            "type": "create|modify|delete|install|run",
            "target": "file path or command",
            "action": "description of what to do",
            "code": "code to insert if applicable"
          }
        ],
        "dependencies": ["npm packages if needed"],
        "tests": ["test files to create/modify"]
      }
      
      Be specific and actionable. Focus on the MovieVerse project structure.
    `;

    try {
      const response = await geminiService.model.generateContent(prompt);
      const result = await response.response;
      const text = result.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Could not parse task');
    } catch (error) {
      // Fallback parsing
      return this.fallbackTaskParsing(taskDescription);
    }
  }

  fallbackTaskParsing(taskDescription) {
    const task = taskDescription.toLowerCase();
    
    // Common patterns
    if (task.includes('install') || task.includes('add package')) {
      return {
        type: 'config',
        priority: 'medium',
        files: [],
        operations: [{ type: 'install', target: 'npm', action: taskDescription }],
        dependencies: [],
        tests: []
      };
    }
    
    if (task.includes('create') || task.includes('add')) {
      return {
        type: 'feature',
        priority: 'medium',
        files: [],
        operations: [{ type: 'create', target: 'new file', action: taskDescription }],
        dependencies: [],
        tests: []
      };
    }
    
    if (task.includes('fix') || task.includes('error') || task.includes('bug')) {
      return {
        type: 'bug_fix',
        priority: 'high',
        files: [],
        operations: [{ type: 'modify', target: 'unknown', action: taskDescription }],
        dependencies: [],
        tests: []
      };
    }
    
    // Default
    return {
      type: 'other',
      priority: 'medium',
      files: [],
      operations: [{ type: 'run', target: 'auto', action: taskDescription }],
      dependencies: [],
      tests: []
    };
  }

  async executeParsedTask(parsedTask, task) {
    const results = [];
    
    // Install dependencies first
    if (parsedTask.dependencies && parsedTask.dependencies.length > 0) {
      for (const dep of parsedTask.dependencies) {
        const result = await this.installDependency(dep, task);
        results.push(result);
      }
    }
    
    // Execute operations
    for (const operation of parsedTask.operations) {
      const result = await this.executeOperation(operation, task);
      results.push(result);
    }
    
    // Run tests if specified
    if (parsedTask.tests && parsedTask.tests.length > 0) {
      for (const test of parsedTask.tests) {
        const result = await this.runTest(test, task);
        results.push(result);
      }
    }
    
    return results;
  }

  async executeOperation(operation, task) {
    const step = {
      operation: operation.type,
      target: operation.target,
      action: operation.action,
      status: 'executing',
      startTime: new Date()
    };
    
    task.steps.push(step);
    
    try {
      let result;
      
      switch (operation.type) {
        case 'create':
          result = await this.createFile(operation.target, operation.code, operation.action);
          break;
        case 'modify':
          result = await this.modifyFile(operation.target, operation.code, operation.action);
          break;
        case 'delete':
          result = await this.deleteFile(operation.target, operation.action);
          break;
        case 'install':
          result = await this.installDependency(operation.target, operation.action);
          break;
        case 'run':
          result = await this.runCommand(operation.target, operation.action);
          break;
        default:
          result = await this.handleUnknownOperation(operation, operation.action);
      }
      
      step.status = 'completed';
      step.endTime = new Date();
      step.result = result;
      
      return result;
    } catch (error) {
      step.status = 'failed';
      step.endTime = new Date();
      step.error = error.message;
      throw error;
    }
  }

  async createFile(filePath, content, description) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Generate content if not provided
      let finalContent = content;
      if (!content) {
        finalContent = await this.generateFileContent(filePath, description);
      }
      
      await fs.writeFile(filePath, finalContent, 'utf8');
      
      return {
        success: true,
        action: 'Created file',
        file: filePath,
        size: finalContent.length
      };
    } catch (error) {
      throw new Error(`Failed to create file ${filePath}: ${error.message}`);
    }
  }

  async modifyFile(filePath, content, description) {
    try {
      // Find the file if not specified
      let targetFile = filePath;
      if (filePath === 'unknown' || !await this.fileExists(filePath)) {
        targetFile = await this.findRelevantFile(description);
      }
      
      if (!targetFile) {
        throw new Error(`Could not find relevant file for: ${description}`);
      }
      
      // Read existing content
      const existingContent = await fs.readFile(targetFile, 'utf8');
      
      // Generate modifications using AI
      const modifiedContent = await this.generateModification(existingContent, description, content);
      
      await fs.writeFile(targetFile, modifiedContent, 'utf8');
      
      return {
        success: true,
        action: 'Modified file',
        file: targetFile,
        changes: this.countChanges(existingContent, modifiedContent)
      };
    } catch (error) {
      throw new Error(`Failed to modify file: ${error.message}`);
    }
  }

  async deleteFile(filePath, description) {
    try {
      await fs.unlink(filePath);
      
      return {
        success: true,
        action: 'Deleted file',
        file: filePath
      };
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }

  async installDependency(packageName, description) {
    try {
      const command = `npm install ${packageName}`;
      const output = execSync(command, { cwd: this.projectRoot, encoding: 'utf8' });
      
      return {
        success: true,
        action: 'Installed dependency',
        package: packageName,
        output: output
      };
    } catch (error) {
      throw new Error(`Failed to install ${packageName}: ${error.message}`);
    }
  }

  async runCommand(command, description) {
    try {
      const output = execSync(command, { cwd: this.projectRoot, encoding: 'utf8' });
      
      return {
        success: true,
        action: 'Ran command',
        command: command,
        output: output
      };
    } catch (error) {
      throw new Error(`Failed to run command: ${error.message}`);
    }
  }

  async handleUnknownOperation(operation, description) {
    // Use AI to handle unknown operations
    const prompt = `
      Execute the following operation in the MovieVerse project:
      "${description}"
      
      Operation type: ${operation.type}
      Target: ${operation.target}
      
      Provide the result as JSON with what was accomplished.
    `;
    
    try {
      const response = await geminiService.model.generateContent(prompt);
      const result = await response.response;
      
      return {
        success: true,
        action: 'Unknown operation handled',
        description: description,
        result: result.text()
      };
    } catch (error) {
      throw new Error(`Failed to handle unknown operation: ${error.message}`);
    }
  }

  async generateFileContent(filePath, description) {
    const prompt = `
      Generate content for a new file in the MovieVerse project:
      
      File path: ${filePath}
      Description: ${description}
      
      Generate appropriate code/content for this file. Consider:
      - File type and extension
      - Project structure and conventions
      - Best practices
      - Error handling
      - Comments where necessary
      
      Provide only the file content, no explanations.
    `;
    
    try {
      const response = await geminiService.model.generateContent(prompt);
      const result = await response.response;
      return result.text();
    } catch (error) {
      throw new Error(`Failed to generate file content: ${error.message}`);
    }
  }

  async generateModification(existingContent, description, suggestedCode) {
    const prompt = `
      Modify the following code based on the description:
      
      Description: ${description}
      ${suggestedCode ? `Suggested code: ${suggestedCode}` : ''}
      
      Existing code:
      \`\`\`javascript
      ${existingContent}
      \`\`\`
      
      Provide the modified code only, maintaining existing structure and style.
    `;
    
    try {
      const response = await geminiService.model.generateContent(prompt);
      const result = await response.response;
      return result.text();
    } catch (error) {
      throw new Error(`Failed to generate modification: ${error.message}`);
    }
  }

  async findRelevantFile(description) {
    const prompt = `
      Based on the description "${description}", which file in the MovieVerse project should be modified?
      
      Consider these common files:
      - backend/src/routes/ (for API routes)
      - backend/src/models/ (for database models)
      - backend/src/middleware/ (for middleware)
      - frontend/src/components/ (for React components)
      - frontend/src/api/ (for API calls)
      - backend/index.js (for main server file)
      - frontend/src/App.jsx (for main React app)
      
      Provide the most likely file path.
    `;
    
    try {
      const response = await geminiService.model.generateContent(prompt);
      const result = await response.response;
      const text = result.text();
      
      // Extract file path from response
      const pathMatch = text.match(/[\w\\\/.-]+\.(js|jsx|json|css|md)/);
      return pathMatch ? pathMatch[0] : null;
    } catch (error) {
      return null;
    }
  }

  async attemptErrorFix(error, task) {
    try {
      const prompt = `
        An error occurred while executing a task in the MovieVerse project:
        
        Task: ${task.description}
        Error: ${error.message}
        
        Provide a solution to fix this error automatically. Consider:
        - Common fixes for this type of error
        - Project-specific solutions
        - Code modifications needed
        - Commands to run
        
        Provide the solution as actionable steps.
      `;
      
      const response = await geminiService.model.generateContent(prompt);
      const result = await response.response;
      
      // Try to execute the suggested fix
      const fixSteps = result.text().split('\n').filter(line => line.trim());
      const fixResults = [];
      
      for (const step of fixSteps) {
        if (step.includes('npm') || step.includes('install')) {
          try {
            const result = await this.runCommand(step, 'Error fix');
            fixResults.push(result);
          } catch (e) {
            fixResults.push({ error: e.message });
          }
        }
      }
      
      return {
        success: fixResults.some(r => r.success),
        result: fixResults,
        suggestion: result.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runTest(testPath, description) {
    try {
      const command = `npm test ${testPath}`;
      const output = execSync(command, { cwd: this.projectRoot, encoding: 'utf8' });
      
      return {
        success: true,
        action: 'Ran tests',
        test: testPath,
        output: output
      };
    } catch (error) {
      return {
        success: false,
        action: 'Test failed',
        test: testPath,
        error: error.message
      };
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  countChanges(original, modified) {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    const additions = Math.max(0, modifiedLines.length - originalLines.length);
    const deletions = Math.max(0, originalLines.length - modifiedLines.length);
    
    return { additions, deletions, total: additions + deletions };
  }

  getTaskHistory() {
    return this.taskHistory;
  }

  getTaskStatus(taskId) {
    return this.taskHistory.find(task => task.id === taskId);
  }
}

module.exports = new AutomationService();
