import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! Looking for the perfect clipper, or need styling advice? I am HairNia AI, here to help.' }
  ]);
  const [input, setInput] = useState('');
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm a placeholder assistant right now, but I'll be fully integrated soon! Can I help you navigate the shop?" 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button if closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-primary-400 text-black shadow-2xl hover:opacity-90 transition-opacity z-50 flex items-center justify-center border border-primary-500/50"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[90vw] sm:w-[380px] h-[500px] max-h-[80vh] bg-[var(--card)] border border-[var(--border)] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-primary-400 text-black border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <h3 className="font-serif italic font-bold">HairNia Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-black/10 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-[var(--background)] space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 text-[11px] uppercase tracking-wider ${
                      msg.role === 'user' 
                        ? 'bg-primary-400 text-black border border-primary-500/50' 
                        : 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <form onSubmit={sendMessage} className="p-3 border-t border-[var(--border)] bg-[var(--card)] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ASK ABOUT TOOLS, PRODUCTS..."
                className="flex-1 bg-[var(--background)] border border-[var(--border)] px-4 py-2 text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary-400 placeholder:text-[var(--foreground)]/30 text-[var(--foreground)]"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-3 bg-primary-400 text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity border border-primary-500/50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
