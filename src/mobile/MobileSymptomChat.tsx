import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Sparkles, 
  Stethoscope, 
  Thermometer, 
  Brain, 
  Heart, 
  Send, 
  Mic,
  MicOff,
  Loader2,
  Bot,
  User,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import MobileDashboardLayout from "@/mobile-layouts/MobileDashboardLayout";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/symptom-chat`;

function extractConditionFromMessages(messages: Message[]): { condition: string; description: string } {
  const userText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('. ');

  const assistantText = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  const conditionKeywords: Record<string, string> = {
    'fever': 'fever', 'viral': 'fever', 'cold': 'fever', 'flu': 'fever', 'influenza': 'fever',
    'fracture': 'fracture', 'broken bone': 'fracture', 'bone fracture': 'fracture',
    'heart': 'cardiac', 'cardiac': 'cardiac', 'chest pain': 'cardiac',
    'bypass': 'bypass',
    'angioplasty': 'angioplasty', 'stent': 'angioplasty',
    'dental': 'dental', 'tooth': 'dental', 'teeth': 'dental',
    'eye': 'eye', 'cataract': 'eye', 'vision': 'eye',
    'delivery': 'maternity', 'pregnancy': 'maternity', 'normal delivery': 'maternity',
    'c-section': 'csection', 'caesarean': 'csection',
    'kidney': 'kidney', 'dialysis': 'kidney', 'renal': 'kidney',
    'transplant': 'transplant',
    'skin': 'skin', 'rash': 'skin', 'dermatolog': 'skin', 'eczema': 'skin',
    'cancer': 'cancer', 'tumor': 'cancer', 'chemotherapy': 'cancer',
    'appendix': 'appendix', 'appendicitis': 'appendix',
    'hernia': 'hernia',
    'knee': 'knee', 'knee replacement': 'knee',
    'spine': 'spine', 'back pain': 'spine', 'disc': 'spine',
    'diabetes': 'diabetes', 'blood sugar': 'diabetes',
    'thyroid': 'thyroid',
    'neuro': 'neuro', 'migraine': 'neuro', 'neurolog': 'neuro', 'headache': 'neuro',
    'stomach': 'fever', 'nausea': 'fever', 'vomit': 'fever',
  };

  let matched = '';
  for (const [keyword, conditionValue] of Object.entries(conditionKeywords)) {
    if (assistantText.includes(keyword) || userText.toLowerCase().includes(keyword)) {
      matched = conditionValue;
      break;
    }
  }

  return { condition: matched, description: userText };
}

export const MobileSymptomChat = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const quickSymptoms = [
    { label: 'High Fever', icon: <Thermometer className="w-3.5 h-3.5 text-emerald-600" /> },
    { label: 'Headache', icon: <Brain className="w-3.5 h-3.5 text-emerald-600" /> },
    { label: 'Chest Discomfort', icon: <Heart className="w-3.5 h-3.5 text-emerald-600" /> },
    { label: 'Stomach Pain', icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> },
  ];

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Enable permissions.');
        }
      };
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputText(transcript);
        if (event.results[event.results.length - 1].isFinal) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      recognitionRef.current.start();
      toast.info('🎤 Speak symptoms now...');
    }
  }, [isListening]);

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
    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
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
        throw new Error(`Error ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder("utf-8");
      let assistantContent = '';
      
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
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch (_) {}
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to get response.');
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSymptom = (label: string) => {
    handleSend(label);
  };

  const handleGoToEstimation = () => {
    const { condition, description } = extractConditionFromMessages(messages);
    navigate('/estimate', {
      state: {
        chatbotCondition: condition || undefined,
        description: description || undefined,
      }
    });
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        return <h4 key={i} className="font-bold text-slate-800 text-[11px] mt-2 mb-1">{line.replace(/^#{2,3}\s/, '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-slate-800 text-xs mt-1.5">{line.replace(/\*\*/g, '')}</p>;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block mb-0.5 text-xs leading-normal">
          {parts.map((p, j) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={j} className="text-slate-800 font-extrabold">{p.replace(/\*\*/g, '')}</strong>
              : p
          )}
        </span>
      );
    });
  };

  return (
    <MobileDashboardLayout>
      <div className="flex flex-col h-[78vh]">
        
        {/* Navigation & Action Bar */}
        <div className="flex justify-between items-center mb-3">
          <Link to="/dashboard" className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-foreground active-scale shrink-0">
            <ChevronLeft className="h-4.5 w-4.5" />
          </Link>
          
          {messages.length > 0 && (
            <button 
              onClick={handleGoToEstimation}
              className="flex items-center gap-1 text-[10px] font-bold bg-primary text-white px-3 py-1.5 rounded-xl hover:bg-primary/95 transition-all shadow-glow active-scale"
            >
              <Calculator className="w-3.5 h-3.5" />
              Estimate Cost →
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 leading-tight">Symptom Assistant</h1>
            <p className="text-[9px] text-slate-500">AI health guidance &bull; Not doctor advice</p>
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto bg-card border border-border/40 rounded-2xl p-3 scroll-bounce flex flex-col space-y-3.5 min-h-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Stethoscope className="w-10 h-10 text-primary opacity-40 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-foreground mb-1">How are you feeling?</h3>
              <p className="text-[10px] text-muted-foreground max-w-[200px] mb-6">
                Describe symptoms, and we'll estimate costs or matching medical specialists.
              </p>

              <div className="grid grid-cols-2 gap-2 w-full">
                {quickSymptoms.map((sym, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickSymptom(sym.label)}
                    className="flex items-center gap-2 p-2.5 border border-border/40 rounded-xl bg-card active-scale text-left text-[10px] font-bold text-foreground"
                  >
                    {sym.icon}
                    <span className="truncate">{sym.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                  )}
                  <div 
                    className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-normal shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-secondary/60 border border-border/20 text-foreground rounded-tl-none'
                    }`}
                  >
                    {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl bg-secondary/60 border border-border/20 rounded-tl-none flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" /> 
                    <span className="text-[10px] text-muted-foreground">Analysing symptoms...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="pt-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoice}
              disabled={!speechSupported}
              className={`p-3 border rounded-xl active-scale shrink-0 ${
                isListening 
                  ? 'bg-red-100 border-red-300 text-red-600 animate-pulse' 
                  : 'bg-card border-border/40 text-foreground'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={isLoading}
              placeholder={isListening ? '🎤 Listening...' : 'Enter your symptoms...'}
              className="flex-1 px-3 py-2.5 h-10 border border-border/40 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-card disabled:bg-muted"
            />

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-primary hover:bg-primary/95 text-white rounded-xl active-scale disabled:bg-primary/40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[8px] text-center text-muted-foreground mt-2">
            ⚕️ AI guidance only.
          </p>
        </div>

      </div>
    </MobileDashboardLayout>
  );
};

export default MobileSymptomChat;
