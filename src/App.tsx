import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Github, Twitter, LogOut } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { streamChat } from './services/gemini';
import { streamGroqChat } from './services/groq';
import { LoginWithSanscounts } from './components/LoginWithSanscounts';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<'gemini' | 'groq'>('groq');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, role: 'model', content: '' },
    ]);

    try {
      if (model === 'gemini') {
        const history = messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));

        const stream = streamChat(history, userMessage);

        for await (const chunk of stream) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      } else {
        const history = messages.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));

        const stream = streamGroqChat(history as any, userMessage);

        for await (const chunk of stream) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      }
    } catch (error: any) {
      console.error('Error in chat:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content:
                  error.message || 'An error occurred while communicating with the AI. Please try again.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-[#ededed] font-sans p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#27272a] bg-[#111111] p-8 shadow-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#27272a] bg-[#18181b] overflow-hidden">
            <img 
              src="https://i.postimg.cc/rppC04Ld/Black-Blue-White-Y2K-Diamond-Pixel-Logo.png" 
              alt="Sansnsi Logo" 
              className="h-10 w-10 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white">
            Welcome to Sansnsi
          </h1>
          <p className="mb-8 text-sm text-[#a1a1aa]">
            Sign in to start chatting with your AI assistant.
          </p>
          <LoginWithSanscounts onLoginSuccess={(userData) => setUser(userData)} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a] text-[#ededed] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#27272a] bg-[#0a0a0a]/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] border border-[#27272a] overflow-hidden">
            <img 
              src="https://i.postimg.cc/rppC04Ld/Black-Blue-White-Y2K-Diamond-Pixel-Logo.png" 
              alt="Logo" 
              className="h-6 w-6 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-sm font-medium tracking-tight text-white">
            Sansnsi
          </span>
          <span className="ml-2 rounded-full border border-[#27272a] bg-[#111111] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#a1a1aa]">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#a1a1aa]">
          {user && user.name && (
            <span className="text-xs font-medium text-[#ededed] hidden sm:inline-block">
              {user.name}
            </span>
          )}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as 'gemini' | 'groq')}
            className="bg-[#111111] border border-[#27272a] text-xs rounded-md px-2 py-1.5 text-[#ededed] focus:outline-none focus:ring-1 focus:ring-[#333333] cursor-pointer"
          >
            <option value="gemini">Gemini 3.1 Pro</option>
            <option value="groq">Groq (Llama 3)</option>
          </select>
          <button 
            onClick={() => setUser(null)}
            className="hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#27272a] bg-[#111111] shadow-2xl overflow-hidden">
              <img 
                src="https://i.postimg.cc/rppC04Ld/Black-Blue-White-Y2K-Diamond-Pixel-Logo.png" 
                alt="Sansnsi Logo" 
                className="h-10 w-10 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="max-w-md text-sm text-[#a1a1aa]">
              A highly capable, 24/7 AI assistant with a sleek Black Forest UI design.
              Start a conversation below.
            </p>
            
            <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "Explain quantum computing in simple terms",
                "Write a React component for a sleek button",
                "How do I optimize a PostgreSQL query?",
                "Draft a professional email to a client",
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  className="flex flex-col items-start justify-center rounded-xl border border-[#27272a] bg-[#111111] p-4 text-left transition-colors hover:bg-[#18181b]"
                >
                  <span className="text-sm font-medium text-[#ededed]">{suggestion}</span>
                  <span className="mt-1 text-xs text-[#a1a1aa]">Click to try this prompt</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl pb-32">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-10">
        <div className="mx-auto max-w-3xl px-4 pb-6">
          <form
            onSubmit={handleSubmit}
            className="relative flex w-full items-end overflow-hidden rounded-2xl border border-[#27272a] bg-[#111111] shadow-sm focus-within:border-[#333333] focus-within:ring-1 focus-within:ring-[#333333]"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message Sansnsi..."
              className="max-h-[200px] min-h-[56px] w-full resize-none bg-transparent py-4 pl-4 pr-12 text-sm text-[#ededed] placeholder:text-[#a1a1aa] focus:outline-none"
              rows={1}
            />
            <div className="absolute bottom-3 right-3">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ededed] text-black transition-opacity disabled:opacity-50 hover:bg-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
          <div className="mt-2 text-center text-xs text-[#a1a1aa]">
            Sansnsi can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
