import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  MicOff,
  Loader2,
  Bot,
  User,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/symptom-chat`;

// Extracts a clean condition keyword and full description from the chat history
function extractConditionFromMessages(messages: Message[]): { condition: string; description: string } {
  // Collect all user messages as the descriptive text
  const userText = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('. ');

  // Look through assistant responses for condition keywords
  const assistantText = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join(' ')
    .toLowerCase();

  // Map common keywords mentioned by the AI → our condition keys
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

const SymptomAssistantUI = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();

  const quickSymptoms = [
    { label: 'I have a fever', icon: <Thermometer className="w-4 h-4 text-emerald-600" /> },
    { label: 'Headache', icon: <Brain className="w-4 h-4 text-emerald-600" /> },
    { label: 'Chest discomfort', icon: <Heart className="w-4 h-4 text-emerald-600" /> },
    { label: 'Stomach pain', icon: <Stethoscope className="w-4 h-4 text-emerald-600" /> },
  ];

  // Initialize Web Speech API
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
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permission.');
        } else if (event.error !== 'aborted') {
          toast.error('Voice recognition error. Please try again.');
        }
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
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
      toast.error('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      recognitionRef.current.start();
      toast.info('🎤 Listening... speak your symptoms now');
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
        const errData = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errData.error || `Error ${resp.status}`);
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
          } catch (_) {
            // Ignore partial chunk parse errors
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to get response. Please try again.');
      // Remove the empty assistant placeholder on error
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

  // Navigate to Cost Estimation passing extracted condition + full description
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
        return <h3 key={i} className="font-bold text-slate-800 text-sm mt-3 mb-1">{line.replace(/^#{2,3}\s/, '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-slate-800 text-sm mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block mb-0.5">
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
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        {messages.length > 0 && (
          <button 
            onClick={handleGoToEstimation}
            className="flex items-center gap-2 text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Calculator className="w-4 h-4" />
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
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-sm h-[70vh] flex flex-col overflow-hidden">
        
        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 flex flex-col ${messages.length === 0 ? 'items-center justify-center' : ''}`}>
          
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
            <div className="space-y-4 max-w-3xl w-full mx-auto pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-emerald-700" />
                    </div>
                  )}
                  <div 
                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-sm' 
                        : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-none'
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

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 rounded-bl-none flex items-center gap-2">
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
            
            {/* Mic Button */}
            <button
              onClick={toggleVoice}
              disabled={!speechSupported}
              title={speechSupported ? (isListening ? 'Stop listening' : 'Start voice input') : 'Voice not supported in this browser'}
              className={`flex-shrink-0 p-3 border rounded-xl transition-colors ${
                isListening 
                  ? 'bg-red-100 border-red-300 text-red-600 animate-pulse' 
                  : speechSupported
                    ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) handleSend();
                }}
                disabled={isLoading}
                placeholder={isListening ? '🎤 Listening...' : 'Describe your symptoms...'}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim()}
              className="flex-shrink-0 p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-200 transition-colors text-white rounded-xl shadow-sm flex items-center justify-center disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
            
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-center text-xs text-slate-400 gap-2 mt-2 pb-1">
            <span>⚕ For guidance only. Not a substitute for professional medical advice.</span>
            {speechSupported && (
              <>
                <span className="hidden sm:inline">&bull;</span>
                <span>{isListening ? '🔴 Recording...' : '🎤 Tap the mic to speak'}</span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SymptomAssistantUI;
