import React from 'react';

function DebugInfo() {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 9999,
      border: '1px solid #ccc'
    }}>
      <strong>Debug Info:</strong><br/>
      API URL: {apiUrl || 'Not set'}
    </div>
  );
}

export default DebugInfo;

