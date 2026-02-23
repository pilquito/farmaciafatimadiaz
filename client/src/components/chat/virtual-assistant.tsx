import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VirtualAssistant({ isOpen, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome-1",
        text: "¡Hola! Bienvenido/a al asistente virtual de Farmacia Fátima Díaz Guillén y Centro Médico Clodina.",
        isBot: true,
        timestamp: new Date(),
      };

      const nameRequest: Message = {
        id: "welcome-2",
        text: "¿Me puedes decir tu nombre para dirigirme a ti?",
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Prefiero no decirlo", "Mi nombre es..."]
      };

      setMessages([welcomeMessage, nameRequest]);
    }
  }, [isOpen, messages.length]);

  const processUserMessage = async (userMessage: string) => {
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    try {
      const response = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage, context: messages }),
      });
      
      const data = await response.json();
      
      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        text: data.response,
        isBot: true,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error al comunicarse con el asistente:', error);
      
      const errorResponse: Message = {
        id: `bot-error-${Date.now()}`,
        text: "Disculpa, estoy teniendo dificultades técnicas. ¿Podrías intentarlo de nuevo?",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsTyping(false);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    await processUserMessage(text);
  };

  const handleSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-96 h-[600px] flex flex-col flex-shrink-0">
        <CardHeader className="bg-primary text-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-robot text-white"></i>
              </div>
              <div>
                <CardTitle className="text-lg">Asistente Virtual</CardTitle>
                <p className="text-sm text-white/80">Farmacia Fátima & Centro Médico Clodina</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
            {messages.map((message) => (
              <div key={message.id} className={cn(
                "flex",
                message.isBot ? "justify-start" : "justify-end"
              )}>
                <div className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2",
                  message.isBot 
                    ? "bg-white text-neutral-800 shadow-sm border" 
                    : "bg-primary text-white"
                )}>
                  <p className="text-sm">{message.text}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {messages.length > 0 && messages[messages.length - 1].suggestions && (
              <div className="flex flex-wrap gap-2 mt-2">
                {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="px-3"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}