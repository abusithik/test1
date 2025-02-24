import React, { useState } from 'react';
import { Send } from 'lucide-react';
import logo from './logo.png'; // Assuming logo.png is in the same directory as your component

// Replace getBaseUrl function
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-render-backend-name.onrender.com'; // You'll get this URL after deploying
  }
  return 'http://localhost:5000';
};

// CSS styles directly in the component for demonstration
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(125deg, #000000 20%, #2E8B49 90%, #FFD700 100%)',
    position: 'relative',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    zIndex: 10,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    justifyContent: 'center',  
    position: 'relative',  
  },
  logo: {
    position: 'absolute',  
    left: '0',  
    width: '120px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  title: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginLeft: '1rem',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 1rem 100px',
  },
  chatContainer: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1rem',
    backdropFilter: 'blur(8px)',
    minHeight: '60vh',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  message: {
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '80%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    display: 'inline-block',
  },
  userMessageContent: {
    backgroundColor: '#4a90e2',
    color: 'white',
  },
  botMessageContent: {
    backgroundColor: 'white',
    color: '#333',
  },
  inputContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
  },
  form: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4a90e2',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

const App = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
        const response = await fetch(`${getBaseUrl()}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });
        const data = await response.json();
        
        setChatHistory([
            ...chatHistory,
            { type: 'question', text: question },
            { type: 'answer', text: data.answer }
        ]);
        
        setQuestion('');
    } catch (error) {
        console.error('Error:', error);
        setChatHistory([
            ...chatHistory,
            { type: 'question', text: question },
            { type: 'answer', text: 'Error processing your question' }
        ]);
    }
    setLoading(false);
};

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <img 
              src={logo}
              alt="RFP Assistant Logo" 
              style={styles.logoImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 style={styles.title}>RFP Assistant</h1>
        </div>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.chatContainer}>
          {chatHistory.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(message.type === 'question' ? styles.userMessage : styles.botMessage),
              }}
            >
              <div
                style={{
                  ...styles.messageContent,
                  ...(message.type === 'question' ? styles.userMessageContent : styles.botMessageContent),
                }}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </main>

      <div style={styles.inputContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your RFP..."
            style={styles.input}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Processing...' : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;