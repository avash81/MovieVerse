import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AutoPilot.css';

const AutoPilot = () => {
  const [status, setStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [taskHistory, setTaskHistory] = useState([]);
  const [autoActions, setAutoActions] = useState([]);

  useEffect(() => {
    fetchStatus();
    fetchMetrics();
    const interval = setInterval(fetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/auto-pilot/status');
      setStatus(response.data.data);
      setIsRunning(response.data.data.isRunning);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/auto-pilot/metrics');
      setMetrics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const startAutoPilot = async () => {
    try {
      const response = await axios.post('/api/auto-pilot/start');
      setStatus(response.data.data);
      setIsRunning(true);
      
      // Update metrics after starting
      setTimeout(fetchMetrics, 1000);
    } catch (error) {
      console.error('Failed to start auto-pilot:', error);
      alert('Failed to start auto-pilot. Please check console for details.');
    }
  };

  const stopAutoPilot = async () => {
    try {
      const response = await axios.post('/api/auto-pilot/stop');
      setStatus(response.data.data);
      setIsRunning(false);
    } catch (error) {
      console.error('Failed to stop auto-pilot:', error);
      alert('Failed to stop auto-pilot. Please check console for details.');
    }
  };

  const executeTask = async () => {
    if (!taskInput.trim()) {
      alert('Please enter a task description');
      return;
    }

    try {
      const response = await axios.post('/api/auto-pilot/execute', {
        task: taskInput.trim()
      });
      
      setTaskHistory(prev => [response.data.data, ...prev.slice(0, 9)]);
      setTaskInput('');
      
      // Refresh status and metrics
      setTimeout(() => {
        fetchStatus();
        fetchMetrics();
      }, 1000);
    } catch (error) {
      console.error('Failed to execute task:', error);
      alert('Failed to execute task. Please check console for details.');
    }
  };

  const performHealthCheck = async () => {
    try {
      const response = await axios.post('/api/auto-pilot/health-check');
      alert('Health check completed! Check console for details.');
      
      // Refresh status
      setTimeout(fetchStatus, 1000);
    } catch (error) {
      console.error('Failed to perform health check:', error);
      alert('Failed to perform health check. Please check console for details.');
    }
  };

  const performAutoFix = async () => {
    try {
      const response = await axios.post('/api/auto-pilot/auto-fix');
      alert('Auto-fix completed! Check console for details.');
      
      // Refresh status
      setTimeout(fetchStatus, 1000);
    } catch (error) {
      console.error('Failed to perform auto-fix:', error);
      alert('Failed to perform auto-fix. Please check console for details.');
    }
  };

  const addSampleContent = async () => {
    try {
      const response = await axios.post('/api/auto-pilot/add-content');
      alert('Sample content added! Check console for details.');
      
      // Refresh metrics
      setTimeout(fetchMetrics, 1000);
    } catch (error) {
      console.error('Failed to add sample content:', error);
      alert('Failed to add sample content. Please check console for details.');
    }
  };

  const emergencyStop = async () => {
    if (!confirm('Are you sure you want to perform an emergency stop? This will halt all auto-pilot processes.')) {
      return;
    }

    try {
      const response = await axios.post('/api/auto-pilot/emergency-stop');
      setStatus(response.data.data);
      setIsRunning(false);
      alert('Emergency stop completed! All processes halted.');
    } catch (error) {
      console.error('Failed to perform emergency stop:', error);
      alert('Failed to perform emergency stop. Please check console for details.');
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatMemory = (bytes) => {
    return Math.round(bytes / 1024 / 1024) + 'MB';
  };

  const getStatusColor = (status) => {
    if (!status) return '#666';
    if (status.issues?.length === 0) return '#4CAF50';
    if (status.issues?.length > 0 && status.issues?.length <= 3) return '#FF9800';
    return '#F44336';
  };

  const quickActions = [
    { id: 'health', name: '🏥 Health Check', action: performHealthCheck, icon: '🏥' },
    { id: 'fix', name: '🔧 Auto-Fix Issues', action: performAutoFix, icon: '🔧' },
    { id: 'content', name: '📝 Add Sample Content', action: addSampleContent, icon: '📝' },
    { id: 'emergency', name: '🛑 Emergency Stop', action: emergencyStop, icon: '🛑', danger: true }
  ];

  return (
    <div className="auto-pilot">
      <div className="header">
        <h1>🤖 Auto-Pilot Mode</h1>
        <p>Autonomous system management and error fixing</p>
      </div>

      <div className="status-panel">
        <div className="status-card">
          <h3>System Status</h3>
          <div className="status-indicator">
            <div className={`status-light ${isRunning ? 'running' : 'stopped'}`}></div>
            <span className="status-text">
              {isRunning ? '🟢 Auto-Pilot Running' : '🔴 Auto-Pilot Stopped'}
            </span>
          </div>
          
          {status && (
            <div className="status-details">
              <div className="status-item">
                <span className="label">Issues:</span>
                <span className="value">{status.issues?.length || 0}</span>
              </div>
              <div className="status-item">
                <span className="label">Queue:</span>
                <span className="value">{status.queueLength || 0}</span>
              </div>
              <div className="status-item">
                <span className="label">Uptime:</span>
                <span className="value">{formatUptime(status.uptime || 0)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="control-panel">
          <h3>Controls</h3>
          <div className="control-buttons">
            {!isRunning ? (
              <button onClick={startAutoPilot} className="control-btn start-btn">
                🚀 Start Auto-Pilot
              </button>
            ) : (
              <button onClick={stopAutoPilot} className="control-btn stop-btn">
                🛑 Stop Auto-Pilot
              </button>
            )}
          </div>

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="action-grid">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`action-btn ${action.danger ? 'danger' : ''}`}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-name">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="task-panel">
        <h3>Execute Task</h3>
        <div className="task-input-area">
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Describe any task (e.g., 'Fix database connection', 'Add new movies', 'Optimize performance')..."
            className="task-textarea"
            rows={3}
          />
          <button onClick={executeTask} className="execute-btn">
            🤖 Execute Task
          </button>
        </div>

        {taskHistory.length > 0 && (
          <div className="task-history">
            <h4>Recent Tasks</h4>
            <div className="history-list">
              {taskHistory.slice(0, 5).map((task, index) => (
                <div key={index} className="history-item">
                  <div className="history-status">
                    {task.success ? '✅' : '❌'}
                  </div>
                  <div className="history-content">
                    <div className="history-task">{task.task}</div>
                    <div className="history-time">
                      {new Date(task.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {metrics && (
        <div className="metrics-panel">
          <h3>System Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <h4>🧠 Memory Usage</h4>
              <div className="metric-content">
                <div className="metric-item">
                  <span className="metric-label">Heap:</span>
                  <span className="metric-value">{formatMemory(metrics.performance?.memoryUsage?.heap || 0)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Total:</span>
                  <span className="metric-value">{formatMemory(metrics.performance?.memoryUsage?.total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h4>⚡ Performance</h4>
              <div className="metric-content">
                <div className="metric-item">
                  <span className="metric-label">Platform:</span>
                  <span className="metric-value">{metrics.performance?.platform || 'Unknown'}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Node.js:</span>
                  <span className="metric-value">{metrics.performance?.nodeVersion || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h4>🤖 Auto-Pilot Features</h4>
              <div className="features-list">
                {metrics.autoPilot?.features && Object.entries(metrics.autoPilot.features).map(([key, value]) => (
                  <div key={key} className="feature-item">
                    <span className={`feature-status ${value ? 'active' : 'inactive'}`}>
                      {value ? '✅' : '❌'}
                    </span>
                    <span className="feature-name">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {status?.lastResults && status.lastResults.length > 0 && (
              <div className="metric-card">
                <h4>📊 Recent Results</h4>
                <div className="results-list">
                  {status.lastResults.slice(0, 3).map((result, index) => (
                    <div key={index} className="result-item">
                      <div className={`result-status ${result.success ? 'success' : 'failed'}`}>
                        {result.success ? '✅' : '❌'}
                      </div>
                      <div className="result-content">
                        <div className="result-task">{result.task}</div>
                        <div className="result-time">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoPilot;
