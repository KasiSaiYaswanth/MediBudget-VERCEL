import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Send,
  Bot,
  User,
  Loader2,
  Calculator,
  Sparkles,
  Heart,
  Thermometer,
  Brain,
  Stethoscope,
  Mic,
} from "lucide-react";
import VoiceInputButton from "@/components/voice/VoiceInputButton";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import EmergencyAlert, { detectEmergencySymptom } from "@/components/emergency/EmergencyAlert";
import { useRealtimeSync } from "@/context/RealtimeSyncContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/symptom-chat`;

const quickPrompts = [
  { icon: Thermometer, label: "I have a fever", message: "I have had a fever since this morning." },
  { icon: Brain, label: "Headache", message: "I have been having a persistent headache." },
  { icon: Heart, label: "Chest discomfort", message: "I feel some discomfort in my chest area." },
  { icon: Stethoscope, label: "Stomach pain", message: "I have been experiencing stomach pain after eating." },
];

const SymptomChecker = () => {
  const { addSymptom } = useRealtimeSync();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emergencySymptom, setEmergencySymptom] = useState<string | null>(null);
  const emergencyShownRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Check for emergency symptoms in any new text
  const checkEmergency = useCallback((text: string) => {
    const detected = detectEmergencySymptom(text);
    if (detected && !emergencyShownRef.current.has(detected)) {
      emergencyShownRef.current.add(detected);
      setEmergencySymptom(detected);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      if (resp.status === 429) toast.error("Too many requests. Please wait a moment.");
      else if (resp.status === 402) toast.error("AI credits exhausted. Please try later.");
      else toast.error(err.error || "Something went wrong.");
      throw new Error(err.error);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Check AI response for emergency indicators
    if (assistantContent) checkEmergency(assistantContent);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    checkEmergency(text.trim());
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updated);
      // Persist the first user message of each conversation as a symptom search record
      if (messages.length === 0) {
        addSymptom({
          symptom: text.trim(),
          predicted_condition: "Pending AI analysis",
          confidence_score: 0.85,
        }).catch((err) => console.warn("[SYNC] Symptom save failed:", err));

        // Also persist to legacy key for HealthDashboard compatibility
        try {
          const history = JSON.parse(localStorage.getItem("medibudget_symptom_history") || "[]");
          history.unshift({ id: crypto.randomUUID(), date: new Date().toISOString(), symptoms: text.trim() });
          localStorage.setItem("medibudget_symptom_history", JSON.stringify(history.slice(0, 20)));
        } catch {}
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const extractConditionForEstimate = () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) {
      // Extract condition info from the last assistant message to pass to cost estimation
      const conditionText = lastAssistant.content.slice(0, 500);
      toast.success("Redirecting to Cost Estimation...");
      navigate("/estimate", {
        state: {
          chatbotCondition: conditionText,
          description: messages.find((m) => m.role === "user")?.content || "",
        },
      });
    }
  };

  return (
    <DashboardLayout>
      {/* Emergency Alert Overlay */}
      <AnimatePresence>
        {emergencySymptom && (
          <EmergencyAlert
            detectedSymptom={emergencySymptom}
            onDismiss={() => setEmergencySymptom(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex-shrink-0 mb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Symptom Assistant</h1>
              <p className="text-xs text-muted-foreground">
                AI-powered health guidance • Not a replacement for medical advice
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-card border-border">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  How are you feeling today?
                </h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Describe your symptoms and I'll help you understand what might be going on,
                  which doctor to visit, and estimated costs.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.message)}
                      className="flex items-center gap-2 p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors text-left"
                    >
                      <qp.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      {qp.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "gradient-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground prose-a:text-primary">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-4 w-4 text-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing your symptoms...
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Action Bar when analysis exists */}
          {messages.length > 2 && !isLoading && (
            <div className="px-4 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-primary/30 text-primary hover:bg-primary/5"
                onClick={extractConditionForEstimate}
              >
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Estimate treatment costs for this condition
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 pt-2 border-t border-border">
            <div className="flex gap-2">
              <VoiceInputButton
                onTranscript={(text) => {
                  setInput(text);
                  // Auto-send after voice capture
                  setTimeout(() => sendMessage(text), 300);
                }}
                disabled={isLoading}
              />
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                variant="hero"
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              ⚕️ For guidance only. Not a substitute for professional medical advice. 🎤 Tap the mic to speak your symptoms.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SymptomChecker;
