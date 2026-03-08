const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async analyzeCode(code, context = '') {
    try {
      const prompt = `
        You are an expert code analyzer and debugger. Analyze the following code and provide:
        1. Error detection and fixes
        2. Code improvements and optimizations
        3. Security vulnerabilities
        4. Best practices recommendations
        
        Context: ${context}
        
        Code to analyze:
        \`\`\`javascript
        ${code}
        \`\`\`
        
        Provide your response in JSON format with the following structure:
        {
          "errors": [{"line": number, "issue": string, "fix": string}],
          "improvements": [{"line": number, "suggestion": string, "code": string}],
          "security": [{"severity": string, "issue": string, "fix": string}],
          "bestPractices": [{"category": string, "recommendation": string}]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        return JSON.parse(text);
      } catch {
        // Fallback if response is not valid JSON
        return {
          errors: [],
          improvements: [],
          security: [],
          bestPractices: [],
          rawResponse: text
        };
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to analyze code with Gemini AI');
    }
  }

  async generateFix(error, code) {
    try {
      const prompt = `
        Fix the following error in the provided code:
        
        Error: ${error}
        
        Code:
        \`\`\`javascript
        ${code}
        \`\`\`
        
        Provide the fixed code only, no explanations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Fix Error:', error);
      throw new Error('Failed to generate fix with Gemini AI');
    }
  }

  async optimizeCode(code, optimizationType = 'performance') {
    try {
      const prompt = `
        Optimize the following code for ${optimizationType}:
        
        Code:
        \`\`\`javascript
        ${code}
        \`\`\`
        
        Provide the optimized code and explain the improvements made.
        Format your response as:
        \`\`\`javascript
        // optimized code here
        \`\`\`
        
        Explanation: [your explanation here]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini Optimization Error:', error);
      throw new Error('Failed to optimize code with Gemini AI');
    }
  }

  async analyzeFile(filePath) {
    try {
      const code = await fs.readFile(filePath, 'utf8');
      const ext = path.extname(filePath);
      const context = `File: ${filePath}, Type: ${ext}`;
      return await this.analyzeCode(code, context);
    } catch (error) {
      console.error('File Analysis Error:', error);
      throw new Error(`Failed to analyze file: ${filePath}`);
    }
  }

  async generateTests(code, testFramework = 'jest') {
    try {
      const prompt = `
        Generate comprehensive unit tests for the following code using ${testFramework}:
        
        Code:
        \`\`\`javascript
        ${code}
        \`\`\`
        
        Include:
        1. Happy path tests
        2. Edge cases
        3. Error handling
        4. Mock dependencies if needed
        
        Provide only the test code.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Test Generation Error:', error);
      throw new Error('Failed to generate tests with Gemini AI');
    }
  }

  async refactorCode(code, refactorType = 'clean-code') {
    try {
      const prompt = `
        Refactor the following code to improve ${refactorType}:
        
        Code:
        \`\`\`javascript
        ${code}
        \`\`\`
        
        Focus on:
        1. Readability
        2. Maintainability
        3. Performance
        4. Best practices
        
        Provide the refactored code with comments explaining major changes.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Refactoring Error:', error);
      throw new Error('Failed to refactor code with Gemini AI');
    }
  }
}

module.exports = new GeminiService();
