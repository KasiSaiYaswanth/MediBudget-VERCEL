import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Sparkles, 
  Stethoscope, 
  Thermometer, 
  Brain, 
  Heart, 
  Send, 
  Mic,
  Loader2,
  Bot,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/symptom-chat`;

const SymptomAssistantUI = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const quickSymptoms = [
    { label: 'I have a fever', icon: <Thermometer className="w-4 h-4 text-emerald-600" /> },
    { label: 'Headache', icon: <Brain className="w-4 h-4 text-emerald-600" /> },
    { label: 'Chest discomfort', icon: <Heart className="w-4 h-4 text-emerald-600" /> },
    { label: 'Stomach pain', icon: <Stethoscope className="w-4 h-4 text-emerald-600" /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || inputText).trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder("utf-8");
      let assistantContent = '';
      
      // Initialize empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
        
        for (const line of lines) {
          const dataStr = line.replace(/^data:\s*/, '').trim();
          if (dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            const deltaContent = data.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = assistantContent;
                return updated;
              });
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSymptom = (label: string) => {
    handleSend(label);
  };

  const renderMessageContent = (content: string) => {
    // Simple fast markdown-style parser for bolding and line breaks
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className="font-bold text-slate-800 text-sm mt-3 mb-1">{line.replace('## ', '')}</h3>;
      }
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block mb-1">
          {parts.map((p, j) => 
            p.startsWith('**') && p.endsWith('**') 
            ? <strong key={j} className="text-slate-800">{p.replace(/\*\*/g, '')}</strong> 
            : p
          )}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 px-4 font-sans text-slate-800">
      
      {/* Top Navigation */}
      <div className="w-full max-w-4xl mb-6 flex justify-between items-end">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        {messages.length > 0 && (
          <button 
            onClick={() => navigate('/estimation', { state: { chatbotCondition: "analyzed condition data" } })}
            className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full hover:bg-emerald-200 transition-colors"
          >
            Go to Cost Estimation →
          </button>
        )}
      </div>

      {/* Header Section */}
      <div className="w-full max-w-4xl flex items-center mb-6">
        <div className="bg-emerald-700 p-2.5 rounded-xl mr-4 shadow-sm flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Symptom Assistant</h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-powered health guidance &bull; Not a replacement for medical advice
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-sm h-[70vh] flex flex-col overflow-hidden relative">
        
        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 flex flex-col ${messages.length === 0 ? 'items-center justify-center' : ''} relative inner-track`}>
          
          {messages.length === 0 ? (
            <>
              <div className="bg-emerald-700 p-4 rounded-2xl mb-6 shadow-sm">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-xl font-semibold text-slate-800 mb-2">How are you feeling today?</h2>
              
              <p className="text-center text-slate-500 text-sm max-w-md mb-8">
                Describe your symptoms and I'll help you understand what might be going on, which doctor to visit, and estimated costs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mx-auto">
                {quickSymptoms.map((symptom, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickSymptom(symptom.label)}
                    className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700 text-left bg-white"
                  >
                    {symptom.icon}
                    {symptom.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6 max-w-3xl w-full mx-auto pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-emerald-700" />
                    </div>
                  )}
                  <div 
                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-sm' 
                        : 'bg-slate-50 border border-slate-100 text-slate-600 rounded-bl-none leading-relaxed'
                    }`}
                  >
                    {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 rounded-bl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> 
                    <span className="text-xs text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-end gap-2 max-w-4xl mx-auto mb-2">
            
            <button className="flex-shrink-0 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">
              <Mic className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={isLoading}
                placeholder="Describe your symptoms..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim()}
              className="flex-shrink-0 p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors text-white rounded-xl shadow-sm flex items-center justify-center disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
            
          </div>
          
          {/* Footer Disclaimer */}
          <div className="flex items-center justify-center text-xs text-slate-400 gap-2 mt-4 pb-2">
            <span className="flex items-center gap-1">
              <span className="text-[10px]">⚕</span> For guidance only. Not a substitute for professional medical advice.
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3" /> Tap the mic to speak your symptoms.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SymptomAssistantUI;
