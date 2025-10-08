import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  text: string;
  isBot: boolean;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm AJAY AI Assistant. Ask me anything about PM-AJAY agencies, projects, or procedures.", isBot: true },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userMessage }
      });

      if (error) throw error;

      // Add bot response
      setMessages((prev) => [...prev, { 
        text: data.reply || "I apologize, but I couldn't generate a response.", 
        isBot: true 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = "Sorry, I couldn't process your request. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (error.message.includes("402")) {
          errorMessage = "AI service is currently unavailable. Please try again later.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setMessages((prev) => [...prev, { 
        text: errorMessage, 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button with Animated Background */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Animated pulsing glow rings */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse"></div>
          
          {/* Main button with gradient */}
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 bg-gradient-to-br from-primary via-primary to-primary/80 hover:shadow-primary/50"
            size="icon"
          >
            <div className="relative">
              <MessageCircle className="h-7 w-7" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse text-yellow-300" />
            </div>
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-primary/20">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground p-4 flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-primary-foreground/30">
                <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                  <MessageCircle className="h-5 w-5 animate-pulse" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-base">AJAY AI Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs text-primary-foreground/80">Online</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages - Scrollable with gradient background */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gradient-to-b from-background to-muted/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.isBot ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.isBot && (
                  <Avatar className="h-8 w-8 shrink-0 border-2 border-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <MessageCircle className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    msg.isBot
                      ? "bg-muted text-foreground rounded-tl-none"
                      : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <Avatar className="h-8 w-8 shrink-0 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    <MessageCircle className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input with gradient background */}
          <div className="p-4 border-t shrink-0 bg-gradient-to-t from-muted/30 to-background backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border-2 focus-visible:ring-primary"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-br from-primary to-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
