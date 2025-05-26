import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import styles from '../styles/Chat.module.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

    try {
      // Send message to backend
      const response = await axios.post('https://tbmc-backend.onrender.com/api/chat', { message: userMessage });
      
      // Add bot response to chat
      setMessages(prev => [...prev, { type: 'bot', text: response.data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Chat with Food Assistant</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Chat with Food Assistant</h1>
        
        <div className={styles.chatContainer}>
          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.welcome}>
                <p>Hello! I'm your food assistant. Ask me about our menu, food recommendations, or help with placing an order.</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`${styles.message} ${styles[msg.type]}`}>
                  {msg.text}
                </div>
              ))
            )}
            {loading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.typing}>Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={sendMessage} className={styles.inputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={loading}
              className={styles.input}
            />
            <button type="submit" disabled={loading} className={styles.sendButton}>
              Send
            </button>
          </form>
        </div>
        
        <div className={styles.navigation}>
          <Link href="/">
            <button className={styles.backButton}>Back to Home</button>
          </Link>
        </div>
      </main>
    </div>
  );
}
