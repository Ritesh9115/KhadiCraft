// src/components/ui/ChatBot.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { chatbotAPI } from '../../services/api';

const QUICK_REPLIES = [
  { icon:'📏', text:'How to take measurements?' },
  { icon:'✂️', text:'How does custom tailoring work?' },
  { icon:'🚚', text:'Shipping & delivery time?' },
  { icon:'📅', text:'How to book an appointment?' },
  { icon:'💰', text:'What are your prices?' },
  { icon:'🧶', text:'Which fabric for summer?' },
  { icon:'↩️', text:'What is your return policy?' },
  { icon:'🏭', text:'Do you offer wholesale?' },
];

export default function ChatBot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '🙏 Namaste! Welcome to **KhadiCraft by Goldy**.\n\nI can help you with fabrics, custom tailoring, measurements, appointments, and orders. What would you like to know?',
      time: new Date(),
    }
  ]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showQuick,setShowQuick]= useState(true);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const formatText = (text) => {
    // Bold **text**
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setShowQuick(false);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
    setLoading(true);

    try {
      // Build history for context (last 6 messages)
      const history = messages.slice(-6).map(m => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await chatbotAPI.send({ message: msg, history });

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.data.reply || "I'm sorry, I couldn't process that. Please try again.",
        time: new Date(),
        source: res.data.source,
      }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm having trouble connecting right now 😔\n\nFor immediate help:\n📞 **+91 78300 57297**\n✉️ hello@khadicraft.in",
        time: new Date(),
        source: 'error',
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 500,
          width: '58px', height: '58px', borderRadius: '50%',
          background: open ? '#0D2A1E' : '#1B4332',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(27,67,50,0.45)',
          transition: 'all .3s', fontSize: '1.4rem',
          transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '98px', right: '28px', zIndex: 499,
          width: '360px', maxHeight: '540px',
          background: '#fff', borderRadius: '18px',
          boxShadow: '0 16px 56px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid #e5e7eb',
          animation: 'chatSlideUp .25s ease',
        }}>
          <style>{`
            @keyframes chatSlideUp {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes dotBounce {
              0%, 80%, 100% { transform: translateY(0); }
              40%            { transform: translateY(-6px); }
            }
            .chat-input:focus { border-color: #1B4332 !important; }
            .quick-btn:hover  { border-color: #1B4332 !important; color: #1B4332 !important; background: #f0fdf4 !important; }
            .send-btn:hover:not(:disabled) { background: #0D2A1E !important; }
          `}</style>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🧵</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>KhadiCraft Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', display: 'block', flexShrink: 0 }}/>
                Online · Typically replies instantly
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.7)', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8f9fa' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', maxWidth: '85%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0, marginBottom: '2px' }}>🧵</div>
                  )}
                  <div style={{
                    padding: '10px 13px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user' ? '#1B4332' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#111',
                    fontSize: '0.83rem', lineHeight: 1.6,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }} dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}/>
                </div>
                <div style={{ fontSize: '0.62rem', color: '#9ca3af', marginTop: '3px', paddingLeft: msg.role === 'assistant' ? '32px' : '0', paddingRight: msg.role === 'user' ? '0' : '0' }}>
                  {formatTime(msg.time)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0 }}>🧵</div>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '14px 14px 14px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#9ca3af', animation: `dotBounce 1.2s ${i * 0.2}s infinite ease-in-out` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Quick Replies */}
          {showQuick && messages.length <= 1 && (
            <div style={{ padding: '8px 12px', background: '#f8f9fa', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '0.67rem', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Questions</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {QUICK_REPLIES.slice(0, 4).map((q, i) => (
                  <button key={i} className="quick-btn" onClick={() => sendMessage(q.text)} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: '14px', background: '#fff', cursor: 'pointer', fontSize: '0.72rem', color: '#374151', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{q.icon}</span>{q.text.split(' ').slice(0, 3).join(' ')}…
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px 12px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              style={{
                flex: 1, padding: '9px 12px', border: '1.5px solid #e5e7eb',
                borderRadius: '10px', fontSize: '0.83rem', outline: 'none',
                fontFamily: 'inherit', resize: 'none', maxHeight: '80px',
                lineHeight: 1.5, transition: 'border .2s', overflowY: 'auto',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: input.trim() && !loading ? '#1B4332' : '#e5e7eb',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: '#fff', fontSize: '1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s', flexShrink: 0,
              }}
              title="Send message (Enter)"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
