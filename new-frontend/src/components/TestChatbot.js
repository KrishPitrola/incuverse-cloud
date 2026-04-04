import React from 'react';

const TestChatbot = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      backgroundColor: 'red',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      zIndex: 9999,
      cursor: 'pointer'
    }}>
      💬
    </div>
  );
};

export default TestChatbot;
