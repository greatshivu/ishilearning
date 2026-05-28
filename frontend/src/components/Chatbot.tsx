import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/admin/settings');
        setIsEnabled(res.data?.chatbotEnabled ?? false);
      } catch (err) {
        setIsEnabled(false);
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await api.post('/chatbot', {message:userMsg, threadId: ""} );
      setMessages((prev) => [...prev, { role: 'bot', content: res.data.response }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'bot', content: err.readableMessage || 'Something went wrong.' }]);
    }
  };

  if (!isEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
      >
        {isOpen ? <X /> : <MessageSquare />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 flex h-[500px] w-[350px] flex-col rounded-2xl border bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-2 rounded-t-2xl bg-blue-600 p-4 text-white">
              <Bot size={24} />
              <span className="font-bold">Shivaraj's AI Assistant</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <p className="text-center text-sm text-gray-500">How can I help you today?</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {/* <p className="text-sm">{msg.content}</p> */}
                    <div className={`p-3 rounded-lg ${
                        msg.role === 'bot' ? 'bg-gray-200 text-black' : 'bg-blue-500 text-white'
                      }`}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-4 dark:border-gray-700">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border bg-gray-50 px-4 py-2 text-sm focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                />
                <button type="submit" className="text-blue-600 hover:text-blue-700">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
