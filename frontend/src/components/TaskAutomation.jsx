import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskAutomation.css';

const TaskAutomation = () => {
  const [task, setTask] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('execute');
  const [quickFixes] = useState([
    { id: 'deps', name: 'Install Dependencies', issue: 'dependencies' },
    { id: 'build', name: 'Fix Build Errors', issue: 'build error' },
    { id: 'port', name: 'Fix Port Issues', issue: 'port error' },
    { id: 'import', name: 'Fix Import Errors', issue: 'import error' },
    { id: 'cors', name: 'Fix CORS Issues', issue: 'cors' },
    { id: 'env', name: 'Setup Environment', issue: 'env' }
  ]);

  useEffect(() => {
    fetchTaskHistory();
  }, []);

  const fetchTaskHistory = async () => {
    try {
      const response = await axios.get('/api/automation/history');
      setTaskHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to fetch task history:', error);
    }
  };

  const executeTask = async () => {
    if (!task.trim()) {
      alert('Please enter a task description');
      return;
    }

    setIsExecuting(true);
    setResults([]);

    try {
      const response = await axios.post('/api/automation/execute', {
        task: task.trim()
      });

      const newResult = {
        id: Date.now(),
        task: task.trim(),
        timestamp: new Date(),
        ...response.data.result
      };

      setResults(prev => [newResult, ...prev]);
      setTask('');
      fetchTaskHistory(); // Refresh history
    } catch (error) {
      const errorResult = {
        id: Date.now(),
        task: task.trim(),
        timestamp: new Date(),
        success: false,
        error: error.response?.data?.error || error.message
      };
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeQuickFix = async (issue) => {
    setIsExecuting(true);
    setResults([]);

    try {
      const response = await axios.post('/api/automation/quick-fix', {
        issue
      });

      const newResult = {
        id: Date.now(),
        task: `Quick Fix: ${issue}`,
        timestamp: new Date(),
        ...response.data
      };

      setResults(prev => [newResult, ...prev]);
      fetchTaskHistory();
    } catch (error) {
      const errorResult = {
        id: Date.now(),
        task: `Quick Fix: ${issue}`,
        timestamp: new Date(),
        success: false,
        error: error.response?.data?.error || error.message
      };
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  const runAutoFix = async () => {
    setIsExecuting(true);
    setResults([]);

    try {
      const response = await axios.post('/api/automation/auto-fix');

      const newResult = {
        id: Date.now(),
        task: 'Auto-Fix Project Issues',
        timestamp: new Date(),
        ...response.data
      };

      setResults(prev => [newResult, ...prev]);
      fetchTaskHistory();
    } catch (error) {
      const errorResult = {
        id: Date.now(),
        task: 'Auto-Fix Project Issues',
        timestamp: new Date(),
        success: false,
        error: error.response?.data?.error || error.message
      };
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  const runHealthCheck = async () => {
    setIsExecuting(true);
    setResults([]);

    try {
      const response = await axios.get('/api/automation/health-check');

      const newResult = {
        id: Date.now(),
        task: 'Project Health Check',
        timestamp: new Date(),
        ...response.data
      };

      setResults(prev => [newResult, ...prev]);
    } catch (error) {
      const errorResult = {
        id: Date.now(),
        task: 'Project Health Check',
        timestamp: new Date(),
        success: false,
        error: error.response?.data?.error || error.message
      };
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  const installDependencies = async () => {
    setIsExecuting(true);
    setResults([]);

    try {
      const response = await axios.post('/api/automation/install-deps');

      const newResult = {
        id: Date.now(),
        task: 'Install Missing Dependencies',
        timestamp: new Date(),
        ...response.data
      };

      setResults(prev => [newResult, ...prev]);
      fetchTaskHistory();
    } catch (error) {
      const errorResult = {
        id: Date.now(),
        task: 'Install Missing Dependencies',
        timestamp: new Date(),
        success: false,
        error: error.response?.data?.error || error.message
      };
      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (result) => {
    if (result.success === false) return '❌';
    if (result.success === true) return '✅';
    return '⏳';
  };

  const renderResultDetails = (result) => {
    if (result.error) {
      return (
        <div className="result-error">
          <strong>Error:</strong> {result.error}
          {result.fixAttempted && (
            <div className="fix-attempt">
              <strong>Fix Attempted:</strong> {result.fixAttempted ? 'Yes' : 'No'}
            </div>
          )}
        </div>
      );
    }

    if (result.result && Array.isArray(result.result)) {
      return (
        <div className="result-steps">
          {result.result.map((step, index) => (
            <div key={index} className="result-step">
              <div className="step-header">
                <span className="step-status">{getStatusIcon(step)}</span>
                <span className="step-action">{step.action}</span>
              </div>
              {step.target && (
                <div className="step-target">
                  <strong>Target:</strong> {step.target}
                </div>
              )}
              {step.error && (
                <div className="step-error">
                  <strong>Error:</strong> {step.error}
                </div>
              )}
              {step.result && (
                <div className="step-result">
                  <strong>Result:</strong>
                  <pre>{JSON.stringify(step.result, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="result-summary">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="task-automation">
      <div className="header">
        <h1>🚀 Task Automation</h1>
        <p>Provide tasks and I'll execute them automatically without asking questions</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'execute' ? 'active' : ''}`}
          onClick={() => setActiveTab('execute')}
        >
          Execute Task
        </button>
        <button
          className={`tab ${activeTab === 'quick-fix' ? 'active' : ''}`}
          onClick={() => setActiveTab('quick-fix')}
        >
          Quick Fixes
        </button>
        <button
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Results
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="content">
        {activeTab === 'execute' && (
          <div className="execute-tab">
            <div className="task-input">
              <h3>📝 Describe Your Task</h3>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Example: Add a new API endpoint for user ratings, Fix the login bug, Install react-router-dom, Create a new component for movie details..."
                className="task-textarea"
                rows={4}
                disabled={isExecuting}
              />
              <div className="task-actions">
                <button
                  onClick={executeTask}
                  disabled={isExecuting || !task.trim()}
                  className="execute-button"
                >
                  {isExecuting ? '🔄 Executing...' : '🚀 Execute Task'}
                </button>
                <button
                  onClick={runAutoFix}
                  disabled={isExecuting}
                  className="auto-fix-button"
                >
                  {isExecuting ? '🔄 Auto-fixing...' : '🔧 Auto-Fix Project'}
                </button>
                <button
                  onClick={runHealthCheck}
                  disabled={isExecuting}
                  className="health-button"
                >
                  {isExecuting ? '🔄 Checking...' : '🏥 Health Check'}
                </button>
                <button
                  onClick={installDependencies}
                  disabled={isExecuting}
                  className="deps-button"
                >
                  {isExecuting ? '🔄 Installing...' : '📦 Install Dependencies'}
                </button>
              </div>
            </div>

            <div className="examples">
              <h4>💡 Example Tasks:</h4>
              <div className="example-list">
                <div className="example" onClick={() => setTask('Add a new API endpoint for user comments')}>
                  Add a new API endpoint for user comments
                </div>
                <div className="example" onClick={() => setTask('Fix the CORS error in the backend')}>
                  Fix the CORS error in the backend
                </div>
                <div className="example" onClick={() => setTask('Create a search component for movies')}>
                  Create a search component for movies
                </div>
                <div className="example" onClick={() => setTask('Install and configure Redux for state management')}>
                  Install and configure Redux for state management
                </div>
                <div className="example" onClick={() => setTask('Add unit tests for the authentication system')}>
                  Add unit tests for the authentication system
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quick-fix' && (
          <div className="quick-fix-tab">
            <h3>🔧 Quick Fixes</h3>
            <div className="quick-fix-grid">
              {quickFixes.map((fix) => (
                <button
                  key={fix.id}
                  onClick={() => executeQuickFix(fix.issue)}
                  disabled={isExecuting}
                  className="quick-fix-card"
                >
                  <div className="fix-icon">⚡</div>
                  <div className="fix-name">{fix.name}</div>
                  <div className="fix-description">{fix.issue}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-tab">
            <h3>📊 Recent Results</h3>
            {results.length === 0 ? (
              <div className="no-results">
                <p>No tasks executed yet. Try executing a task!</p>
              </div>
            ) : (
              <div className="results-list">
                {results.map((result) => (
                  <div key={result.id} className="result-card">
                    <div className="result-header">
                      <span className="result-status">{getStatusIcon(result)}</span>
                      <span className="result-task">{result.task}</span>
                      <span className="result-time">{formatTimestamp(result.timestamp)}</span>
                    </div>
                    <div className="result-details">
                      {renderResultDetails(result)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <h3>📜 Task History</h3>
            {taskHistory.length === 0 ? (
              <div className="no-history">
                <p>No task history available.</p>
              </div>
            ) : (
              <div className="history-list">
                {taskHistory.map((task) => (
                  <div key={task.id} className="history-item">
                    <div className="history-header">
                      <span className="history-status">{getStatusIcon(task)}</span>
                      <span className="history-task">{task.description}</span>
                      <span className="history-time">{formatTimestamp(task.startTime)}</span>
                    </div>
                    <div className="history-details">
                      <div className="history-duration">
                        <strong>Duration:</strong> {task.endTime ? 
                          `${Math.round((new Date(task.endTime) - new Date(task.startTime)) / 1000)}s` : 
                          'In progress'
                        }
                      </div>
                      {task.steps && task.steps.length > 0 && (
                        <div className="history-steps">
                          <strong>Steps:</strong> {task.steps.length}
                        </div>
                      )}
                      {task.error && (
                        <div className="history-error">
                          <strong>Error:</strong> {task.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isExecuting && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Executing your task...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAutomation;
