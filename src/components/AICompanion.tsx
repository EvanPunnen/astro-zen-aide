import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Brain, 
  Heart, 
  Lightbulb,
  Mic,
  MicOff
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  emotion?: string;
}

const aiResponses = {
  stress: [
    "I understand you're feeling stressed. Let's try a breathing exercise together. Breathe in for 4 counts, hold for 4, and breathe out for 6.",
    "Stress is natural in space operations. Remember your training - you're equipped to handle this. What specific concern is troubling you?",
    "Your physiological readings suggest elevated stress. Would you like me to guide you through a progressive muscle relaxation technique?"
  ],
  anxiety: [
    "I can sense your anxiety levels are elevated. You're safe on the station, and your crewmates are with you. Let's ground ourselves - tell me 3 things you can see right now.",
    "Anxiety in space is more common than you might think. Even experienced astronauts feel this way. What would help you feel more centered right now?",
    "Your training has prepared you for this moment. Remember Commander Chen's words: 'We adapt, we overcome, we excel.' How can I support you?"
  ],
  fatigue: [
    "Your sleep patterns show you need rest. The mission is important, but so is your well-being. When did you last take a proper break?",
    "Fatigue can affect decision-making. I'm recommending a 20-minute power nap. I'll monitor the systems while you rest.",
    "Your body is telling you something important. Listen to it. Even astronauts need to recharge."
  ],
  focused: [
    "I can see you're in excellent focus. This is the perfect time to tackle complex tasks. How can I assist with your current objectives?",
    "Your cognitive state is optimal. This would be an ideal time for critical mission operations or learning new procedures.",
    "Great mental clarity detected. Is there anything challenging you'd like to work on while you're in this focused state?"
  ]
};

export const AICompanion = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm ASTRA, your AI companion. I'm here to support your psychological well-being during your space mission. How are you feeling today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response based on keywords
    setTimeout(() => {
      let aiResponse = "Thank you for sharing that with me. I'm here to listen and support you through any challenges.";
      
      const lowerInput = inputValue.toLowerCase();
      if (lowerInput.includes('stress') || lowerInput.includes('pressure')) {
        aiResponse = aiResponses.stress[Math.floor(Math.random() * aiResponses.stress.length)];
      } else if (lowerInput.includes('anxious') || lowerInput.includes('worried') || lowerInput.includes('nervous')) {
        aiResponse = aiResponses.anxiety[Math.floor(Math.random() * aiResponses.anxiety.length)];
      } else if (lowerInput.includes('tired') || lowerInput.includes('exhausted') || lowerInput.includes('fatigue')) {
        aiResponse = aiResponses.fatigue[Math.floor(Math.random() * aiResponses.fatigue.length)];
      } else if (lowerInput.includes('focused') || lowerInput.includes('ready') || lowerInput.includes('good')) {
        aiResponse = aiResponses.focused[Math.floor(Math.random() * aiResponses.focused.length)];
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In a real implementation, this would start/stop voice recognition
  };

  return (
    <Card className="space-panel h-[600px] flex flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center ai-glow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">ASTRA AI Companion</h3>
              <p className="text-sm text-muted-foreground">Psychological Support Assistant</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={isListening ? "emergency" : "outline"}
              size="sm"
              onClick={toggleListening}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground border border-border'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Share your thoughts or concerns..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} variant="space" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-center space-x-4 mt-3">
          <Button variant="ghost" size="sm" className="text-xs">
            <Heart className="w-3 h-3 mr-1" />
            Wellness Tips
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            Coping Strategies  
          </Button>
          <Button variant="ghost" size="sm" className="text-xs">
            <MessageCircle className="w-3 h-3 mr-1" />
            Emergency Support
          </Button>
        </div>
      </div>
    </Card>
  );
};