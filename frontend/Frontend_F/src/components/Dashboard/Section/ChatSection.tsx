import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Mic, Volume2, StopCircle } from "lucide-react";
import { apiClient, type ChatRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// --- Browser Speech API Types ---
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}
// --- End of Types ---

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSectionProps {
  language: "en" | "hi" | "gu";
}

const translationsData = {
  en: {
    title: "AI Farming Assistant",
    placeholder: "Ask or press the mic...",
    send: "Send",
    welcome: "Hello! I'm your AI farming expert. Ask me anything about:",
    topics: "• Crop selection and planting times\n• Soil health and fertilizers\n• Irrigation and water management\n• Pest control and diseases\n• Government schemes and subsidies\n• Weather-based farming advice\n• Modern farming techniques",
    error: "Failed to get response",
    thinking: "Thinking...",
    micError: "Mic error or permission denied",
    micNotSupported: "Voice input is not supported in this browser.",
  },
  hi: {
    title: "AI खेती सहायक",
    placeholder: "पूछें या माइक दबाएं...",
    send: "भेजें",
    welcome: "नमस्ते! मैं आपका AI खेती विशेषज्ञ हूं। मुझसे कुछ भी पूछें:",
    topics: "• फसल चयन और रोपण समय\n• मिट्टी स्वास्थ्य और उर्वरक\n• सिंचाई और जल प्रबंधन\n• कीट नियंत्रण और रोग\n• सरकारी योजनाएं और सब्सिडी\n• मौसम आधारित खेती सलाह\n• आधुनिक खेती तकनीक",
    error: "प्रतिक्रिया प्राप्त करने में विफल",
    thinking: "सोच रहा हूँ...",
    micError: "माइक त्रुटि या अनुमति नहीं मिली",
    micNotSupported: "इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है।",
  },
  gu: {
    title: "AI ખેતી સહાયક",
    placeholder: "પૂછો અથવા માઇક દબાવો...",
    send: "મોકલો",
    welcome: "નમસ્તે! હું તમારો AI ખેતી નિષ્ણાત છું. મને કંઈપણ પૂછો:",
    topics: "• પાક પસંદગી અને વાવેતર સમય\n• જમીન સ્વાસ્થ્ય અને ખાતર\n• સિંચાઈ અને પાણી સંચાલન\n• જીવાત નિયંત્રણ અને રોગો\n• સરકારી યોજનાઓ અને સબસિડી\n• હવામાન આધારિત ખેતી સલાહ\n• આધુનિક ખેતી તકનીક",
    error: "પ્રતિસાદ મેળવવામાં નિષ્ફળ",
    thinking: "વિચાર ચાલી રહ્યો છે...",
    micError: "માઇક ભૂલ અથવા પરવાનગી નકારી",
    micNotSupported: "આ બ્રાઉઝરમાં વૉઇસ ઇનપુટ સપોર્ટેડ નથી.",
  },
};

const speechLangMap: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  gu: 'gu-IN',
};

export const ChatSection = ({ language }: ChatSectionProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedHistory = localStorage.getItem("chatHistory");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.warn("Could not parse chat history from localStorage", error);
      return [];
    }
  });

  const [conversationId, setConversationId] = useState<string | undefined>(
    () => localStorage.getItem("chatConversationId") || undefined
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // This state now tracks the index of the message that is *actively speaking*
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  // Track which messages are expanded
  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const t = translationsData[language || 'en'];

  useEffect(() => {
    if (conversationId) localStorage.setItem("chatConversationId", conversationId);
    if (messages.length > 1) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    } else if (messages.length === 0) {
      localStorage.removeItem("chatHistory");
      localStorage.removeItem("chatConversationId");
    }
  }, [conversationId, messages]);

  useEffect(() => {
    const welcomeMessage: Message = {
      role: "assistant",
      content: `${t.welcome}\n\n${t.topics}`
    };

    setMessages(currentMessages => {
      if (currentMessages.length === 0) {
        return [welcomeMessage];
      }
      if (currentMessages.length > 0 && currentMessages[0].role === 'assistant' && currentMessages[0].content.includes("AI farming expert")) {
        const newMessages = [...currentMessages];
        newMessages[0] = welcomeMessage;
        return newMessages;
      }
      return currentMessages;
    });
  }, [language, t.welcome, t.topics]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- SIMPLIFIED Text-to-Speech Function (Stop/Replay) ---
  const speakText = (text: string, index: number) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) {
        console.warn("Browser does not support speech synthesis.");
        return;
      }

      const isCurrentlySpeakingThis = speakingMessageIndex === index;

      // Stop any and all speech
      synth.cancel();

      // Case 1: User clicked the 'Stop' button (on the message that was playing)
      if (isCurrentlySpeakingThis) {
        setSpeakingMessageIndex(null);
        return;
      }

      // Case 2: User clicked the 'Play' button
      const newUtterance = new SpeechSynthesisUtterance(text);
      newUtterance.lang = speechLangMap[language || 'en'];

      // This is the KEY: This automatically resets the state when speech finishes
      newUtterance.onend = () => {
        setSpeakingMessageIndex(null);
      };
      newUtterance.onerror = (e) => {
        console.error("Error during speech synthesis:", e);
        setSpeakingMessageIndex(null);
      };

      // Start speaking
      synth.speak(newUtterance);
      setSpeakingMessageIndex(index);

    } catch (e) {
      console.error("Error speaking text:", e);
      setSpeakingMessageIndex(null);
    }
  };
  // --- END OF UPDATE ---

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast({ title: t.micError, description: event.error, variant: "destructive" });
        setIsListening(false);
      };

      recognitionRef.current = recognitionInstance;
    } else {
      console.warn("Browser does not support speech recognition.");
    }
  }, [language, t.micError, toast]);

  const handleMicClick = () => {
    if (isLoading || isListening) return;

    if (!recognitionRef.current) {
      toast({ title: t.micNotSupported, variant: "destructive" });
      return;
    }

    try {
      // Stop any speech before listening
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);

      recognitionRef.current.lang = speechLangMap[language || 'en'];
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error("Error starting mic:", e);
      toast({ title: t.micError, variant: "destructive" });
    }
  };

  const handleSend = async (textOverride?: string) => {
    const messageContent = textOverride || input.trim();

    if (!messageContent || isLoading) return;

    // Stop any speech before sending
    window.speechSynthesis.cancel();
    setSpeakingMessageIndex(null);

    setInput("");
    setIsLoading(true);

    const userMessage: Message = { role: "user", content: messageContent };
    setMessages(prev => [...prev, userMessage]);

    try {
      const request: ChatRequest = {
        message: messageContent,
        conversation_id: conversationId,
        user_id: 'demo-user',
        language: language
      };

      const response = await apiClient.sendChatMessage(request);

      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id);
      }

      const aiMessage: Message = {
        role: "assistant",
        content: response.message
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the response *after* it's in the state
      const newIndex = messages.length + 1; // The index it *will* have
      speakText(response.message, newIndex);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-4 border-b bg-green-600 text-white rounded-t-xl flex items-center gap-3">
        <div className="relative p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse absolute -top-1 -right-1"></div>
          <Mic className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-xs text-green-100 font-normal mt-0.5 opacity-90">Always here to help you</p>
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/80" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map((message, index) => {
          const isThisMessageSpeaking = speakingMessageIndex === index;
          const isExpanded = expandedMessages.has(index);
          const messageLength = message.content.length;
          const shouldTruncate = messageLength > 300 && !isExpanded;
          const displayContent = shouldTruncate
            ? message.content.substring(0, 300) + '...'
            : message.content;

          const toggleExpanded = () => {
            setExpandedMessages(prev => {
              const newSet = new Set(prev);
              if (newSet.has(index)) {
                newSet.delete(index);
              } else {
                newSet.add(index);
              }
              return newSet;
            });
          };

          return (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative group max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${message.role === "user"
                    ? "ml-auto bg-green-600 text-white"
                    : "mr-auto bg-white border border-gray-200"
                  }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {displayContent}
                </div>

                {messageLength > 300 && (
                  <button
                    onClick={toggleExpanded}
                    className={`mt-2 text-xs font-medium underline ${message.role === "user"
                        ? "text-green-100 hover:text-white"
                        : "text-green-600 hover:text-green-800"
                      }`}
                  >
                    {isExpanded ? "Show Less" : "Read More"}
                  </button>
                )}

                {message.role === 'assistant' && (
                  <button
                    className="absolute -top-2 -right-2 h-7 w-7 bg-white shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-50 flex items-center justify-center border border-gray-200"
                    onClick={() => speakText(message.content, index)}
                  >
                    {isThisMessageSpeaking ? (
                      <StopCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-auto bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500 ml-2">{t.thinking}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex gap-2 items-center">
          <button
            onClick={handleMicClick}
            disabled={isLoading}
            className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all ${isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={t.placeholder}
            disabled={isLoading || isListening}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />

          <button
            onClick={() => handleSend()}
            disabled={isLoading || isListening || !input.trim()}
            className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all ${!input.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              } disabled:opacity-50`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

