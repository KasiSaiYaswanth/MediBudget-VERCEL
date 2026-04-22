import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Sparkles, 
  Stethoscope, 
  Thermometer, 
  Brain, 
  Heart, 
  Send, 
  Mic 
} from 'lucide-react';

const SymptomAssistantUI = () => {
  const [inputText, setInputText] = useState('');
  const navigate = useNavigate();

  const quickSymptoms = [
    { label: 'I have a fever', icon: <Thermometer className="w-4 h-4 text-emerald-600" /> },
    { label: 'Headache', icon: <Brain className="w-4 h-4 text-emerald-600" /> },
    { label: 'Chest discomfort', icon: <Heart className="w-4 h-4 text-emerald-600" /> },
    { label: 'Stomach pain', icon: <Stethoscope className="w-4 h-4 text-emerald-600" /> },
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;
    // Add logic to handle message sending here
    console.log('Sending:', inputText);
    setInputText('');
  };

  const handleQuickSymptom = (label: string) => {
    setInputText(label);
    // You can optionally auto-send here
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-8 px-4 font-sans text-slate-800">
      
      {/* Top Navigation */}
      <div className="w-full max-w-4xl mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
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
        <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center relative inner-track">
          
          {/* Scrollbar Track Visual (Just for design precision if needed, standard browser scrollbar works) */}
          <div className="absolute right-1 top-2 bottom-2 w-1.5 bg-slate-100 rounded-full hidden md:block">
            <div className="w-full bg-slate-300 rounded-full h-1/3 mt-2"></div>
          </div>

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
                placeholder="Describe your symptoms..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 text-sm bg-white"
              />
            </div>

            <button 
              onClick={handleSend}
              className="flex-shrink-0 p-3 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white rounded-xl shadow-sm flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
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
