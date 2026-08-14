import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

const VoiceInputButton = ({ onTranscript, disabled, className }: VoiceInputButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const getSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return null;
    }
    return new SpeechRecognition();
  }, []);

  const stopListening = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      await SpeechRecognition.stop();
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  const startListening = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { speechRecognition } = await SpeechRecognition.checkPermissions();
        if (speechRecognition !== 'granted') {
          const { speechRecognition: req } = await SpeechRecognition.requestPermissions();
          if (req !== 'granted') {
            toast.error('Microphone permission required.');
            return;
          }
        }
        setIsListening(true);
        toast.info("🎤 Listening...", { duration: 2000 });
        
        SpeechRecognition.addListener('partialResults', (data: any) => {
          if (data.matches && data.matches.length > 0) {
            setInterimText(data.matches[0]);
          }
        });

        await SpeechRecognition.start({
          language: "en-IN",
          maxResults: 1,
          prompt: "Speak your symptoms...",
          partialResults: true,
          popup: false,
        });

        timeoutRef.current = setTimeout(() => {
          stopListening();
          // We can't automatically grab the final text reliably from partialResults here
          // But interimText will contain the latest match
        }, 8000);
      } catch (e) {
        toast.error("Could not start microphone.");
        setIsListening(false);
      }
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("🎤 Listening... Speak your symptoms", { duration: 2000 });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);

      // Auto-stop after 2s of silence once we have final text
      if (finalTranscript.trim()) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          recognition.stop();
        }, 2000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
        toast.success("Voice input captured!", { duration: 1500 });
      }
      setInterimText("");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setInterimText("");
      recognitionRef.current = null;
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permission.");
      } else if (event.error === "no-speech") {
        toast.info("No speech detected. Please try again.");
      } else if (event.error !== "aborted") {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Max 30s recording
    timeoutRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, 30000);
  }, [getSpeechRecognition, onTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        onClick={() => {
          if (isListening && Capacitor.isNativePlatform()) {
            if (interimText.trim()) onTranscript(interimText.trim());
          }
          toggleListening();
        }}
        disabled={disabled}
        className={`relative overflow-hidden transition-all ${className || ""}`}
        title={isListening ? "Stop recording" : "Speak your symptoms"}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <MicOff className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring when listening */}
        {isListening && (
          <motion.span
            className="absolute inset-0 rounded-md border-2 border-destructive"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </Button>

      {/* Interim text tooltip */}
      <AnimatePresence>
        {isListening && interimText && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-1.5 shadow-elevated text-xs text-muted-foreground whitespace-nowrap max-w-[200px] truncate"
          >
            🎤 {interimText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInputButton;
