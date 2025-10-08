import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
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
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Button
            onClick={() => setIsOpen(true)}
            className="relative rounded-full h-16 w-16 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 bg-gradient-to-br from-primary via-primary to-primary/80 group"
            size="icon"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="h-7 w-7 relative z-10" />
            <Sparkles className="h-4 w-4 absolute top-2 right-2 animate-pulse text-primary-foreground" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl shadow-primary/20 z-50 flex flex-col border-2 border-primary/20 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground p-4 rounded-t-lg flex items-center justify-between shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-foreground/20 rounded-full blur-md animate-pulse" />
                <div className="relative bg-primary-foreground/10 p-2 rounded-full backdrop-blur-sm border border-primary-foreground/20">
                  <Bot className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg">AJAY AI Assistant</h3>
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20 relative z-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gradient-to-b from-background/50 to-background">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {msg.isBot && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.isBot
                      ? "bg-muted/80 text-foreground border border-border/50"
                      : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted/80 border border-border/50 text-foreground rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50 shrink-0 bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border-primary/20 focus-visible:ring-primary/30 bg-background"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
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
