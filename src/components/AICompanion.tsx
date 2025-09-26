import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Brain, 
  Heart, 
  Lightbulb,
  Mic,
  MicOff,
  Droplets,
  Coffee,
  Activity,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  emotion?: string;
  priority?: 'normal' | 'high' | 'critical';
}

interface UserProfile {
  stressLevel: number;
  lastHydration: Date;
  lastBreak: Date;
  sleepQuality: number;
  emotionHistory: string[];
  preferences: {
    reminderFrequency: number;
    voiceEnabled: boolean;
  };
}

// Enhanced AI response system with context awareness
const contextualResponses = {
  greeting: [
    "Good morning! I've been monitoring your vitals. How did you sleep?",
    "Hello there! Your stress levels look good today. What's on your mission agenda?",
    "Hi! I noticed you've been quite focused lately. How are you feeling right now?"
  ],
  stress: {
    mild: [
      "I'm detecting slight elevation in your stress markers. Want to talk about what's on your mind?",
      "Your breathing pattern suggests some tension. Let's try a quick 2-minute mindfulness exercise.",
      "I notice you're feeling a bit stressed. Would you like me to guide you through some breathing techniques?"
    ],
    moderate: [
      "Your stress levels are elevated. This is completely normal in space operations. Let's work through this together.",
      "I can see you're dealing with some pressure right now. Remember, you're trained for this. What specific challenge can I help with?",
      "Your biometrics show increased stress. Let's pause and center ourselves. Tell me what's troubling you most."
    ],
    high: [
      "I'm concerned about your current stress levels. Let's take immediate action to help you feel better.",
      "Your stress indicators are quite high. I'm here to support you through this. Please tell me what's happening.",
      "This level of stress needs attention. I'm switching to priority support mode. You're safe, and we'll work through this."
    ]
  },
  fatigue: [
    "Your cognitive performance metrics suggest fatigue. When did you last take a proper rest?",
    "I'm detecting tiredness in your voice patterns. Rest is not optional - it's mission critical.",
    "Your reaction times are slower than baseline. Let's schedule a recovery period."
  ],
  focused: [
    "Excellent cognitive state detected! This is perfect timing for complex tasks.",
    "Your mental clarity is optimal right now. What important work should we tackle?",
    "Great focus levels! This would be ideal for critical mission operations."
  ],
  hydration: [
    "Reminder: You haven't logged water intake in 3 hours. Dehydration affects cognitive performance significantly in microgravity.",
    "Time for hydration! Your body needs 2.5L daily in space. How are you feeling?",
    "Hydration check: Your concentration might improve with some water. Let's stay on top of this!"
  ]
};

const emergencyProtocols = {
  panic: "I'm detecting panic symptoms. Let's use the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, 1 thing you taste.",
  depression: "I'm concerned about persistent low mood indicators. You're not alone up there. Let's talk, and I'll also prepare a wellness report for ground team consultation.",
  isolation: "Isolation is one of the biggest challenges in space. You're connected to your crew, ground team, and me. Let's strengthen those connections."
};

export const AICompanion = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm ASTRA, your voice-enabled AI companion. I'm continuously monitoring your well-being and ready to have a conversation with you. Would you like to enable voice mode so we can talk naturally?",
      timestamp: new Date(),
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Start with voice enabled
  const [autoListen, setAutoListen] = useState(false);
  const { toast } = useToast();
  
  // User profile and adaptive learning
  const [userProfile, setUserProfile] = useState<UserProfile>({
    stressLevel: 3,
    lastHydration: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    lastBreak: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
    sleepQuality: 7,
    emotionHistory: ['focused', 'mild_stress', 'focused'],
    preferences: {
      reminderFrequency: 180, // 3 hours in minutes
      voiceEnabled: false
    }
  });

  // Proactive monitoring and reminders
  useEffect(() => {
    const checkWellbeing = () => {
      const now = new Date();
      const timeSinceHydration = (now.getTime() - userProfile.lastHydration.getTime()) / (1000 * 60);
      const timeSinceBreak = (now.getTime() - userProfile.lastBreak.getTime()) / (1000 * 60);

      // Hydration reminder
      if (timeSinceHydration > 180) { // 3 hours
        sendSystemMessage(
          contextualResponses.hydration[Math.floor(Math.random() * contextualResponses.hydration.length)],
          'high'
        );
      }

      // Break reminder
      if (timeSinceBreak > 150) { // 2.5 hours
        sendSystemMessage(
          "Break time! You've been working for 2.5 hours. Even astronauts need regular breaks for optimal performance.",
          'high'
        );
      }

      // Stress level monitoring
      if (userProfile.stressLevel > 7) {
        sendSystemMessage(
          "I'm monitoring elevated stress levels. Would you like to talk or try some relaxation techniques?",
          'critical'
        );
      }
    };

    const interval = setInterval(checkWellbeing, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [userProfile]);

  const sendSystemMessage = (content: string, priority: 'normal' | 'high' | 'critical' = 'normal') => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content,
      timestamp: new Date(),
      priority
    };

    setMessages(prev => [...prev, systemMessage]);
    
    if (voiceEnabled && priority !== 'normal') {
      speakMessage(content);
    }

    // Show toast for high priority messages
    if (priority === 'high' || priority === 'critical') {
      toast({
        title: priority === 'critical' ? "Critical Alert" : "Health Reminder",
        description: content,
        variant: priority === 'critical' ? "destructive" : "default",
      });
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced voice settings for clearer AI assistant voice
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.pitch = 1.0; // More natural pitch
      utterance.volume = 0.9; // Higher volume
      
      // Try to use a more suitable voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') || 
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const getContextualResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Analyze user input for stress indicators
    let detectedStressLevel = 'mild';
    if (lowerInput.includes('panic') || lowerInput.includes('can\'t handle') || lowerInput.includes('overwhelmed')) {
      detectedStressLevel = 'high';
    } else if (lowerInput.includes('anxious') || lowerInput.includes('worried') || lowerInput.includes('pressure')) {
      detectedStressLevel = 'moderate';
    }

    // Update user profile based on detected emotion
    setUserProfile(prev => ({
      ...prev,
      stressLevel: detectedStressLevel === 'high' ? 8 : detectedStressLevel === 'moderate' ? 6 : 4,
      emotionHistory: [...prev.emotionHistory.slice(-4), detectedStressLevel] // Keep last 5 emotions
    }));

    // Emergency protocols
    if (lowerInput.includes('panic') || lowerInput.includes('help me') && lowerInput.includes('can\'t')) {
      return emergencyProtocols.panic;
    }
    
    if (lowerInput.includes('alone') || lowerInput.includes('isolated') || lowerInput.includes('lonely')) {
      return emergencyProtocols.isolation;
    }

    // Contextual responses based on detected stress
    if (lowerInput.includes('stress') || lowerInput.includes('pressure') || lowerInput.includes('anxious')) {
      const responses = contextualResponses.stress[detectedStressLevel as keyof typeof contextualResponses.stress];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerInput.includes('tired') || lowerInput.includes('exhausted') || lowerInput.includes('fatigue')) {
      return contextualResponses.fatigue[Math.floor(Math.random() * contextualResponses.fatigue.length)];
    }
    
    if (lowerInput.includes('focused') || lowerInput.includes('ready') || lowerInput.includes('good')) {
      return contextualResponses.focused[Math.floor(Math.random() * contextualResponses.focused.length)];
    }

    // Hydration/break responses
    if (lowerInput.includes('water') || lowerInput.includes('drink') || lowerInput.includes('hydrat')) {
      setUserProfile(prev => ({ ...prev, lastHydration: new Date() }));
      return "Great! Staying hydrated is crucial in microgravity. Your cognitive performance and physical well-being depend on it. How do you feel now?";
    }

    if (lowerInput.includes('break') || lowerInput.includes('rest')) {
      setUserProfile(prev => ({ ...prev, lastBreak: new Date() }));
      return "Excellent choice! Regular breaks are essential for maintaining peak performance. Use this time to stretch, hydrate, or just breathe. You're doing great.";
    }

    // Default contextual responses based on conversation history
    const recentEmotions = userProfile.emotionHistory.slice(-3);
    if (recentEmotions.filter(e => e.includes('stress')).length >= 2) {
      return "I've noticed you've been experiencing stress lately. This is completely normal during space missions. Your training has prepared you for this. What would help you feel more centered right now?";
    }

    // Personalized responses based on user profile
    const responses = [
      `Based on your recent interactions, you seem to handle challenges well. I'm here to support you - what's on your mind?`,
      `Your stress management has been impressive lately. How can I assist you today?`,
      `I've been learning your patterns, and you're showing great resilience. What would you like to discuss?`,
      `Your psychological profile shows strong adaptation. I'm here to help optimize your well-being further.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputValue;
    setInputValue('');

    // Generate contextual AI response
    setTimeout(() => {
      const aiResponse = getContextualResponse(messageToProcess);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (voiceEnabled) {
        speakMessage(aiResponse);
        
        // In auto-listen mode, automatically start listening for next response
        if (autoListen) {
          setTimeout(() => {
            if (!isListening && !isSpeaking) {
              startVoiceRecognition();
            }
          }, 3000); // Wait 3 seconds after AI finishes speaking
        }
      }
    }, 1000 + Math.random() * 1000); // Variable delay for more natural feel
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now, I'm listening to you.",
        });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        
        // Auto-send message in voice conversation mode
        if (autoListen && transcript.trim()) {
          setTimeout(() => {
            handleSendMessage();
          }, 100);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not process your speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);
    setUserProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, voiceEnabled: newVoiceState }
    }));
    
    // Welcome message when enabling voice
    if (newVoiceState) {
      setTimeout(() => {
        speakMessage("Voice mode activated! I can now speak to you. Try asking me how you're feeling or if you need any health reminders.");
      }, 500);
    } else {
      speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  const startConversation = () => {
    setAutoListen(true);
    speakMessage("I'm ready to have a conversation with you. What's on your mind today?");
    setTimeout(() => {
      if (!isListening) {
        startVoiceRecognition();
      }
    }, 2000);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleWellnessAction = (action: string) => {
    switch (action) {
      case 'hydration':
        setUserProfile(prev => ({ ...prev, lastHydration: new Date() }));
        sendSystemMessage("Hydration logged! Remember, staying hydrated in microgravity is crucial for your cognitive performance.", 'normal');
        break;
      case 'break':
        setUserProfile(prev => ({ ...prev, lastBreak: new Date() }));
        sendSystemMessage("Break time logged! Your body and mind need regular recovery periods. Well done on prioritizing self-care.", 'normal');
        break;
      case 'emergency':
        sendSystemMessage("Emergency support activated. I'm here to help. Please describe what you're experiencing, and I'll provide immediate guidance.", 'critical');
        break;
      default:
        sendSystemMessage("I'm here to support you. What specific area would you like help with?", 'normal');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Health Monitoring Dashboard */}
      <Card className="space-panel lg:col-span-1">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-primary flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Health Monitoring
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Stress Level</span>
              <span>{userProfile.stressLevel}/10</span>
            </div>
            <Progress value={userProfile.stressLevel * 10} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Sleep Quality</span>
              <span>{userProfile.sleepQuality}/10</span>
            </div>
            <Progress value={userProfile.sleepQuality * 10} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center">
                <Droplets className="w-4 h-4 mr-1" />
                Last Hydration
              </span>
              <Badge variant="outline" className="text-xs">
                {Math.round((new Date().getTime() - userProfile.lastHydration.getTime()) / (1000 * 60))}m ago
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center">
                <Coffee className="w-4 h-4 mr-1" />
                Last Break
              </span>
              <Badge variant="outline" className="text-xs">
                {Math.round((new Date().getTime() - userProfile.lastBreak.getTime()) / (1000 * 60))}m ago
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Recent Emotions</h4>
            <div className="flex flex-wrap gap-1">
              {userProfile.emotionHistory.slice(-5).map((emotion, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {emotion.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Chat Interface */}
      <Card className="space-panel h-[600px] flex flex-col lg:col-span-2">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center ai-glow">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">ASTRA AI Companion</h3>
                <p className="text-sm text-muted-foreground">
                  Adaptive Psychological Support • {isSpeaking ? 'Speaking...' : 'Ready'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={voiceEnabled ? "space" : "outline"}
                size="sm"
                onClick={toggleVoice}
                title="Toggle voice mode"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              {isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeaking}
                  title="Stop speaking"
                >
                  Stop
                </Button>
              )}
              <Button
                variant={autoListen ? "space" : "outline"}
                size="sm"
                onClick={() => autoListen ? setAutoListen(false) : startConversation()}
                title="Start voice conversation"
              >
                {autoListen ? "End Chat" : "Talk"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWellnessAction('emergency')}
              >
                <Heart className="w-4 h-4" />
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
                      : message.type === 'system'
                      ? `border-l-4 ${
                          message.priority === 'critical' 
                            ? 'border-destructive bg-destructive/10' 
                            : message.priority === 'high'
                            ? 'border-warning bg-warning/10'
                            : 'border-primary bg-primary/10'
                        } bg-card`
                      : 'bg-muted text-foreground border border-border'
                  }`}
                >
                  {message.type === 'system' && (
                    <div className="flex items-center mb-2">
                      <Activity className="w-4 h-4 mr-2" />
                      <span className="text-xs font-semibold">
                        {message.priority === 'critical' ? 'CRITICAL ALERT' : 
                         message.priority === 'high' ? 'HEALTH REMINDER' : 'SYSTEM'}
                      </span>
                    </div>
                  )}
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
          <div className="flex space-x-2 mb-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "🎤 Listening..." : autoListen ? "Voice conversation active..." : "Type your message or use voice..."}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isListening}
            />
            <Button
              variant={isListening ? "space" : "outline"}
              size="icon"
              onClick={startVoiceRecognition}
              disabled={isListening}
              title="Voice input"
            >
              {isListening ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isListening}
              variant="space" 
              size="icon"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-center space-x-2 flex-wrap gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => handleWellnessAction('hydration')}
            >
              <Droplets className="w-3 h-3 mr-1" />
              Log Hydration
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => handleWellnessAction('break')}
            >
              <Coffee className="w-3 h-3 mr-1" />
              Log Break
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => handleWellnessAction('sleep')}
            >
              <Moon className="w-3 h-3 mr-1" />
              Sleep Tips
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => handleWellnessAction('emergency')}
            >
              <Heart className="w-3 h-3 mr-1" />
              Emergency Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};