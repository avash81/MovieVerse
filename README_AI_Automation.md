# AI Automation for MovieVerse

This document describes the AI automation features integrated into MovieVerse using Google Gemini AI.

## Features

### 🤖 AI-Powered Code Analysis
- **Error Detection**: Automatically identify syntax errors, logical errors, and potential bugs
- **Code Improvements**: Get suggestions for better code structure and performance
- **Security Analysis**: Detect security vulnerabilities and get remediation suggestions
- **Best Practices**: Ensure your code follows industry best practices

### 🛠️ Automated Tools
- **Error Fixing**: Automatically fix common JavaScript errors
- **Code Optimization**: Optimize code for performance, readability, or security
- **Test Generation**: Generate comprehensive unit tests automatically
- **Code Refactoring**: Refactor code following clean code principles
- **File Analysis**: Analyze entire project files for issues

## Setup

### 1. Environment Configuration
1. Copy `.env.example` to `.env` in the backend directory
2. Add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install @google/generative-ai

# Frontend (dependencies already included)
cd ../frontend
npm install
```

### 3. Start the Application
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Usage

### Accessing AI Tools
1. Navigate to `http://localhost:5173`
2. Click on "🤖 AI Tools" in the navigation menu
3. You'll be taken to the AI Automation dashboard

### Code Analysis
1. Go to the "Code Analysis" tab
2. Paste your JavaScript code in the text area
3. Click "🔍 Analyze Code" to get comprehensive analysis
4. Review errors, improvements, security issues, and best practices

### Error Fixing
1. After analysis, click "🛠️ Auto Fix" next to any error
2. The AI will automatically generate fixed code
3. Review and apply the suggested fixes

### Code Optimization
1. Select optimization type (Performance, Readability, Security, Maintainability)
2. Click "⚡ Optimize" to get optimized code
3. Compare original and optimized versions

### Test Generation
1. Paste your code in the text area
2. Select test framework (Jest, Mocha, Jasmine)
3. Click "🧪 Generate Tests" to get comprehensive unit tests

### File Analysis
1. Go to the "File Analysis" tab
2. Browse your project structure
3. Select a file to analyze
4. Click "🔍 Analyze Selected File"

## API Endpoints

The AI automation system provides the following REST API endpoints:

### POST /api/ai/analyze-code
Analyze code for errors, improvements, and best practices
```json
{
  "code": "your javascript code here",
  "context": "optional context"
}
```

### POST /api/ai/fix-error
Fix specific errors in code
```json
{
  "error": "error description",
  "code": "your code here"
}
```

### POST /api/ai/optimize-code
Optimize code for specific goals
```json
{
  "code": "your code here",
  "optimizationType": "performance|readability|security|maintainability"
}
```

### POST /api/ai/generate-tests
Generate unit tests for code
```json
{
  "code": "your code here",
  "testFramework": "jest|mocha|jasmine"
}
```

### POST /api/ai/refactor-code
Refactor code following clean code principles
```json
{
  "code": "your code here",
  "refactorType": "clean-code"
}
```

### POST /api/ai/analyze-file
Analyze entire project files
```json
{
  "filePath": "path/to/file.js"
}
```

### GET /api/ai/project-structure
Get project structure for file browsing
Returns JSON representation of project directory structure

## Security Considerations

- File access is restricted to backend and frontend directories only
- All API requests are logged for monitoring
- Gemini API key is stored securely in environment variables
- No code is executed server-side - all processing is done by Gemini AI

## Troubleshooting

### Common Issues

1. **Gemini API Key Error**
   - Ensure your API key is correctly set in `.env`
   - Verify the API key has the necessary permissions
   - Check if you have sufficient API quota

2. **File Access Denied**
   - Only backend and frontend directories are accessible
   - Ensure file paths are absolute and correct

3. **Analysis Timeout**
   - Large files may take longer to analyze
   - Consider breaking down large code chunks

4. **Frontend Not Loading**
   - Ensure both backend and frontend are running
   - Check CORS configuration in backend

### Getting Help

1. Check the browser console for frontend errors
2. Check the backend console for API errors
3. Verify your Gemini API key and quota
4. Ensure all dependencies are properly installed

## Best Practices

1. **Code Quality**: Use the AI tools regularly to maintain code quality
2. **Security**: Run security analysis before deploying to production
3. **Testing**: Generate tests for new code to ensure coverage
4. **Documentation**: Keep your code well-documented for better AI analysis

## Future Enhancements

- Support for additional programming languages
- Real-time code analysis as you type
- Integration with CI/CD pipelines
- Code review automation
- Performance profiling
- Automated documentation generation
