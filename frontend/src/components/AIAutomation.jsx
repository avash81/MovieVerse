import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIAutomation.css';

const AIAutomation = () => {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyze');
  const [projectStructure, setProjectStructure] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [optimizationType, setOptimizationType] = useState('performance');
  const [testFramework, setTestFramework] = useState('jest');

  useEffect(() => {
    fetchProjectStructure();
  }, []);

  const fetchProjectStructure = async () => {
    try {
      const response = await axios.get('/api/ai/project-structure');
      setProjectStructure(response.data.structure);
    } catch (err) {
      console.error('Failed to fetch project structure:', err);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await axios.post('/api/ai/analyze-code', {
        code,
        context: 'MovieVerse project code analysis'
      });
      setAnalysis(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze code');
    } finally {
      setLoading(false);
    }
  };

  const fixError = async (errorText) => {
    if (!code.trim() || !errorText.trim()) {
      setError('Please provide both code and error description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/ai/fix-error', {
        error: errorText,
        code
      });
      setCode(response.data.fixedCode);
      setAnalysis(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fix error');
    } finally {
      setLoading(false);
    }
  };

  const optimizeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to optimize');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/ai/optimize-code', {
        code,
        optimizationType
      });
      setCode(response.data.optimizedCode);
      setAnalysis(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to optimize code');
    } finally {
      setLoading(false);
    }
  };

  const generateTests = async () => {
    if (!code.trim()) {
      setError('Please enter some code to generate tests for');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/ai/generate-tests', {
        code,
        testFramework
      });
      setAnalysis({ tests: response.data.tests });
      setActiveTab('tests');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate tests');
    } finally {
      setLoading(false);
    }
  };

  const refactorCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to refactor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/ai/refactor-code', {
        code,
        refactorType: 'clean-code'
      });
      setCode(response.data.refactoredCode);
      setAnalysis(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to refactor code');
    } finally {
      setLoading(false);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) {
      setError('Please select a file to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await axios.post('/api/ai/analyze-file', {
        filePath: selectedFile
      });
      setAnalysis(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze file');
    } finally {
      setLoading(false);
    }
  };

  const renderFileTree = (structure, prefix = '') => {
    return Object.entries(structure || {}).map(([name, item]) => {
      if (item.type === 'file') {
        return (
          <div key={name} className="file-item">
            <span className="file-icon">📄</span>
            <button
              className={`file-button ${selectedFile === item.path ? 'selected' : ''}`}
              onClick={() => setSelectedFile(item.path)}
            >
              {name}
            </button>
          </div>
        );
      } else {
        return (
          <div key={name} className="folder-item">
            <span className="folder-icon">📁</span>
            <span className="folder-name">{name}</span>
            <div className="folder-content">
              {renderFileTree(item, prefix + '  ')}
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className="ai-automation">
      <div className="header">
        <h1>🤖 AI Code Automation</h1>
        <p>Automate code analysis, error fixing, and optimization with Gemini AI</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          Code Analysis
        </button>
        <button
          className={`tab ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          File Analysis
        </button>
        <button
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Tools
        </button>
        {analysis?.tests && (
          <button
            className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Generated Tests
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="content">
        {activeTab === 'analyze' && (
          <div className="analyze-tab">
            <div className="code-input-section">
              <h3>Enter Code to Analyze</h3>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your JavaScript code here..."
                className="code-textarea"
                rows={15}
              />
              <div className="action-buttons">
                <button onClick={analyzeCode} disabled={loading} className="primary-button">
                  {loading ? 'Analyzing...' : '🔍 Analyze Code'}
                </button>
                <button onClick={optimizeCode} disabled={loading} className="secondary-button">
                  {loading ? 'Optimizing...' : '⚡ Optimize'}
                </button>
                <button onClick={refactorCode} disabled={loading} className="secondary-button">
                  {loading ? 'Refactoring...' : '🔧 Refactor'}
                </button>
                <button onClick={generateTests} disabled={loading} className="secondary-button">
                  {loading ? 'Generating...' : '🧪 Generate Tests'}
                </button>
              </div>
              <div className="options">
                <select
                  value={optimizationType}
                  onChange={(e) => setOptimizationType(e.target.value)}
                  className="option-select"
                >
                  <option value="performance">Performance</option>
                  <option value="readability">Readability</option>
                  <option value="security">Security</option>
                  <option value="maintainability">Maintainability</option>
                </select>
                <select
                  value={testFramework}
                  onChange={(e) => setTestFramework(e.target.value)}
                  className="option-select"
                >
                  <option value="jest">Jest</option>
                  <option value="mocha">Mocha</option>
                  <option value="jasmine">Jasmine</option>
                </select>
              </div>
            </div>

            {analysis && (
              <div className="analysis-results">
                <h3>📊 Analysis Results</h3>
                
                {analysis.errors && analysis.errors.length > 0 && (
                  <div className="analysis-section">
                    <h4>🚨 Errors Found</h4>
                    {analysis.errors.map((error, index) => (
                      <div key={index} className="error-item">
                        <span className="line-number">Line {error.line}:</span>
                        <span className="error-issue">{error.issue}</span>
                        <div className="error-fix">
                          <strong>Fix:</strong> {error.fix}
                        </div>
                        <button
                          onClick={() => fixError(error.issue)}
                          className="fix-button"
                        >
                          🛠️ Auto Fix
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {analysis.improvements && analysis.improvements.length > 0 && (
                  <div className="analysis-section">
                    <h4>💡 Improvements</h4>
                    {analysis.improvements.map((improvement, index) => (
                      <div key={index} className="improvement-item">
                        <span className="line-number">Line {improvement.line}:</span>
                        <span className="improvement-suggestion">{improvement.suggestion}</span>
                        {improvement.code && (
                          <pre className="improvement-code">{improvement.code}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {analysis.security && analysis.security.length > 0 && (
                  <div className="analysis-section">
                    <h4>🔒 Security Issues</h4>
                    {analysis.security.map((issue, index) => (
                      <div key={index} className={`security-item ${issue.severity}`}>
                        <span className="severity">{issue.severity.toUpperCase()}:</span>
                        <span className="security-issue">{issue.issue}</span>
                        <div className="security-fix">
                          <strong>Fix:</strong> {issue.fix}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {analysis.bestPractices && analysis.bestPractices.length > 0 && (
                  <div className="analysis-section">
                    <h4>✨ Best Practices</h4>
                    {analysis.bestPractices.map((practice, index) => (
                      <div key={index} className="practice-item">
                        <span className="practice-category">{practice.category}:</span>
                        <span className="practice-recommendation">{practice.recommendation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'file' && (
          <div className="file-tab">
            <div className="file-browser">
              <h3>📁 Project Files</h3>
              <div className="file-tree">
                {renderFileTree(projectStructure)}
              </div>
              {selectedFile && (
                <button onClick={analyzeFile} disabled={loading} className="analyze-file-button">
                  {loading ? 'Analyzing...' : '🔍 Analyze Selected File'}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="tools-tab">
            <h3>🛠️ AI Tools</h3>
            <div className="tools-grid">
              <div className="tool-card">
                <h4>🔍 Code Analysis</h4>
                <p>Analyze code for errors, improvements, and best practices</p>
                <button onClick={() => setActiveTab('analyze')}>Use Tool</button>
              </div>
              <div className="tool-card">
                <h4>🚨 Error Fixing</h4>
                <p>Automatically fix common JavaScript errors</p>
                <button onClick={() => setActiveTab('analyze')}>Use Tool</button>
              </div>
              <div className="tool-card">
                <h4>⚡ Code Optimization</h4>
                <p>Optimize code for performance, readability, and security</p>
                <button onClick={() => setActiveTab('analyze')}>Use Tool</button>
              </div>
              <div className="tool-card">
                <h4>🧪 Test Generation</h4>
                <p>Generate comprehensive unit tests automatically</p>
                <button onClick={() => setActiveTab('analyze')}>Use Tool</button>
              </div>
              <div className="tool-card">
                <h4>🔧 Code Refactoring</h4>
                <p>Refactor code following clean code principles</p>
                <button onClick={() => setActiveTab('analyze')}>Use Tool</button>
              </div>
              <div className="tool-card">
                <h4>📁 File Analysis</h4>
                <p>Analyze entire project files for issues</p>
                <button onClick={() => setActiveTab('file')}>Use Tool</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && analysis?.tests && (
          <div className="tests-tab">
            <h3>🧪 Generated Tests</h3>
            <pre className="generated-tests">{analysis.tests}</pre>
            <button
              onClick={() => navigator.clipboard.writeText(analysis.tests)}
              className="copy-button"
            >
              📋 Copy Tests
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAutomation;
