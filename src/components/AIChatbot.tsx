import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { agencyMappings, districtData, components } from "@/data/agencies";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  links?: { text: string; url: string }[];
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm AJAY Assistant. I can help you with information about PM-AJAY projects, agencies, and procedures. Try asking me:\n\n• Which agency handles hostels in Tamil Nadu?\n• How many projects are completed in Kerala?\n• How can I apply for Adarsh Gram project?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");

  const generateResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();

    // Agency queries
    if (lowerQuery.includes("agency") || lowerQuery.includes("responsible")) {
      const stateMatch = lowerQuery.match(/tamil nadu|kerala|karnataka|maharashtra|uttar pradesh|rajasthan|gujarat|west bengal/i);
      const componentMatch = lowerQuery.match(/hostel|adarsh gram|ngo|skill|infrastructure/i);

      if (stateMatch || componentMatch) {
        const filtered = agencyMappings.filter((m) => {
          const stateMatches = !stateMatch || m.state.toLowerCase().includes(stateMatch[0]);
          const componentMatches = !componentMatch || m.component.toLowerCase().includes(componentMatch[0]);
          return stateMatches && componentMatches;
        });

        if (filtered.length > 0) {
          const agencies = [...new Set(filtered.flatMap((m) => m.agencies))];
          return {
            id: Date.now().toString(),
            text: `Based on PM-AJAY records, the following agencies are responsible:\n\n${agencies.join(", ")}\n\nYou can view more details on the Agency Mapping page.`,
            isBot: true,
            links: [{ text: "View Agency Mapping", url: "/mapping" }],
          };
        }
      }
    }

    // Project count queries
    if (lowerQuery.includes("how many") && (lowerQuery.includes("project") || lowerQuery.includes("completed"))) {
      const stateMatch = lowerQuery.match(/tamil nadu|kerala|karnataka|maharashtra|uttar pradesh|rajasthan|gujarat|west bengal/i);
      
      if (stateMatch) {
        const state = stateMatch[0];
        const projects = agencyMappings.filter((m) => m.state.toLowerCase().includes(state));
        const completed = projects.filter((p) => p.status === "Completed").length;
        const ongoing = projects.filter((p) => p.status === "Ongoing").length;

        return {
          id: Date.now().toString(),
          text: `In ${state.charAt(0).toUpperCase() + state.slice(1)}:\n\n• Total Projects: ${projects.length}\n• Completed: ${completed}\n• Ongoing: ${ongoing}\n\nView the dashboard for more insights.`,
          isBot: true,
          links: [{ text: "View Dashboard", url: "/dashboard" }],
        };
      }
    }

    // Application queries
    if (lowerQuery.includes("apply") || lowerQuery.includes("how to") || lowerQuery.includes("procedure")) {
      return {
        id: Date.now().toString(),
        text: "To apply for PM-AJAY projects:\n\n1. Visit the Proposal Wizard page\n2. Select your component and location\n3. Fill in project details\n4. Submit for review\n\nOfficials can create proposals, while citizens can submit grievances through the Transparency Portal.",
        isBot: true,
        links: [
          { text: "Create Proposal", url: "/proposal" },
          { text: "Transparency Portal", url: "/transparency" },
        ],
      };
    }

    // Grievance queries
    if (lowerQuery.includes("grievance") || lowerQuery.includes("complaint") || lowerQuery.includes("issue")) {
      return {
        id: Date.now().toString(),
        text: "You can submit grievances and track their status through our Public Transparency Portal. Citizens can report issues and receive a tracking ID for follow-up.",
        isBot: true,
        links: [{ text: "Submit Grievance", url: "/transparency" }],
      };
    }

    // Funds queries
    if (lowerQuery.includes("fund") || lowerQuery.includes("budget") || lowerQuery.includes("money")) {
      const totalAllocated = agencyMappings.reduce((sum, m) => sum + m.fundsAllocated, 0);
      const totalUtilized = agencyMappings.reduce((sum, m) => sum + m.fundsUtilized, 0);
      const utilizationRate = ((totalUtilized / totalAllocated) * 100).toFixed(1);

      return {
        id: Date.now().toString(),
        text: `PM-AJAY Fund Summary:\n\n• Total Allocated: ₹${(totalAllocated / 10000000).toFixed(1)} Cr\n• Total Utilized: ₹${(totalUtilized / 10000000).toFixed(1)} Cr\n• Utilization Rate: ${utilizationRate}%\n\nCheck the Dashboard for detailed breakdowns.`,
        isBot: true,
        links: [{ text: "View Dashboard", url: "/dashboard" }],
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      text: "I can help you with:\n\n• Agency information by state/component\n• Project statistics and status\n• Application procedures\n• Grievance submission\n• Fund utilization data\n\nPlease ask a specific question or explore the portal using the links below.",
      isBot: true,
      links: [
        { text: "Agency Mapping", url: "/mapping" },
        { text: "Dashboard", url: "/dashboard" },
        { text: "Transparency Portal", url: "/transparency" },
      ],
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateResponse(input);
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              Ask AJAY Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.isBot
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      {msg.links && (
                        <div className="mt-2 space-y-1">
                          {msg.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              className="block text-xs text-primary hover:underline"
                            >
                              → {link.text}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about agencies, projects, procedures..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;
