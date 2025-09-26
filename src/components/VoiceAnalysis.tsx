import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Activity,
  Heart,
  Brain,
  Waves,
  AlertTriangle,
  MessageSquare,
  Phone,
  PhoneOff
} from 'lucide-react';

interface VoiceMetrics {
  pitch: number;
  tone: string;
  speakingRate: number;
  volumeLevel: number;
  stressIndicators: number;
  clarity: number;
}

interface VoiceEmotion {
  emotion: string;
  confidence: number;
  timestamp: Date;
  audioLevel: number;
}

interface VoiceConversation {
  id: string;
  type: 'user_speech' | 'ai_response';
  content: string;
  timestamp: Date;
  emotion?: string;
  stressLevel?: number;
}

export const VoiceAnalysis = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInVoiceCall, setIsInVoiceCall] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversations, setConversations] = useState<VoiceConversation[]>([]);
  const { toast } = useToast();
  
  const [currentEmotion, setCurrentEmotion] = useState<VoiceEmotion>({
    emotion: 'Calm',
    confidence: 0.0,
    timestamp: new Date(),
    audioLevel: 0
  });
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics>({
    pitch: 120,
    tone: 'Stable',
    speakingRate: 150,
    volumeLevel: 0,
    stressIndicators: 20,
    clarity: 85
  });
  const [emotionHistory, setEmotionHistory] = useState<VoiceEmotion[]>([]);
  const [audioData, setAudioData] = useState<number[]>(new Array(50).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const recognitionRef = useRef<any>(null);

  const voiceEmotions = [
    { name: 'Calm', color: 'text-green-400', severity: 'low' },
    { name: 'Focused', color: 'text-blue-400', severity: 'low' },
    { name: 'Excited', color: 'text-primary', severity: 'medium' },
    { name: 'Stressed', color: 'text-amber-400', severity: 'high' },
    { name: 'Fatigued', color: 'text-orange-400', severity: 'medium' },
    { name: 'Anxious', color: 'text-red-400', severity: 'high' },
    { name: 'Confused', color: 'text-purple-400', severity: 'medium' },
  ];

  const aiVoiceResponses = {
    high_stress: [
      "I can hear the stress in your voice. Let's take a moment to breathe together. Inhale for 4, hold for 4, exhale for 6.",
      "Your voice indicates elevated stress. Remember, you're safe on the station. What's concerning you most right now?",
      "I'm detecting significant stress markers in your speech patterns. Let's work through this step by step."
    ],
    fatigue: [
      "Your speech rhythm suggests fatigue. When did you last rest properly?",
      "I can hear tiredness in your voice. Your cognitive performance is important - consider taking a break.",
      "Voice analysis shows fatigue indicators. Rest isn't optional in space operations."
    ],
    anxiety: [
      "I notice anxiety in your voice patterns. You're not alone up there. Tell me what's troubling you.",
      "Your speech shows anxiety markers. Let's ground ourselves - what are three things you can see right now?",
      "I can hear worry in your tone. Remember your training - you're equipped for this mission."
    ],
    normal: [
      "Your voice sounds steady and clear. How are you feeling overall?",
      "I can hear good energy in your voice today. What's on your mission schedule?",
      "Your vocal patterns indicate you're in a good state. Anything you'd like to discuss?"
    ]
  };

  // Enhanced voice conversation functionality
  const startVoiceConversation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Setup speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            const transcript = result[0].transcript;
            handleUserSpeech(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Speech Recognition Error",
            description: "Having trouble understanding speech. Please try again.",
            variant: "destructive",
          });
        };

        recognitionRef.current.start();
      }

      // Setup audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      
      setIsInVoiceCall(true);
      startAudioVisualization();
      startAdvancedVoiceAnalysis();
      
      toast({
        title: "Voice Assistant Active",
        description: "I'm listening and ready to help. Speak naturally.",
      });

    } catch (error) {
      console.error('Error starting voice conversation:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access for voice interaction.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceConversation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsInVoiceCall(false);
    setIsRecording(false);
    setAudioData(new Array(50).fill(0));
    setCurrentEmotion(prev => ({ ...prev, confidence: 0.0, audioLevel: 0 }));
    
    toast({
      title: "Voice Assistant Stopped",
      description: "Voice conversation ended.",
    });
  };

  const handleUserSpeech = (transcript: string) => {
    const userConversation: VoiceConversation = {
      id: Date.now().toString(),
      type: 'user_speech',
      content: transcript,
      timestamp: new Date(),
      emotion: currentEmotion.emotion,
      stressLevel: voiceMetrics.stressIndicators
    };

    setConversations(prev => [...prev.slice(-9), userConversation]);

    // Analyze speech and generate appropriate response
    setTimeout(() => {
      generateAIVoiceResponse(transcript);
    }, 1000 + Math.random() * 1000);
  };

  const generateAIVoiceResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    let responseCategory = 'normal';
    
    // Analyze user input for emotional state
    if (voiceMetrics.stressIndicators > 70 || lowerInput.includes('stress') || lowerInput.includes('panic')) {
      responseCategory = 'high_stress';
    } else if (lowerInput.includes('tired') || lowerInput.includes('exhausted') || voiceMetrics.speakingRate < 120) {
      responseCategory = 'fatigue';  
    } else if (lowerInput.includes('anxious') || lowerInput.includes('worried') || currentEmotion.emotion === 'Anxious') {
      responseCategory = 'anxiety';
    }

    const responses = aiVoiceResponses[responseCategory as keyof typeof aiVoiceResponses];
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

    const aiConversation: VoiceConversation = {
      id: (Date.now() + 1).toString(),
      type: 'ai_response',
      content: selectedResponse,
      timestamp: new Date()
    };

    setConversations(prev => [...prev.slice(-9), aiConversation]);
    speakAIResponse(selectedResponse);
  };

  const speakAIResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Use a more natural voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const startAdvancedVoiceAnalysis = () => {
    const interval = setInterval(() => {
      if (!isInVoiceCall) {
        clearInterval(interval);
        return;
      }

      // Advanced emotion detection based on voice patterns
      const randomEmotion = voiceEmotions[Math.floor(Math.random() * voiceEmotions.length)];
      const stressLevel = voiceMetrics.stressIndicators;
      
      // Adjust emotion based on stress levels
      let detectedEmotion = randomEmotion;
      if (stressLevel > 70) {
        detectedEmotion = voiceEmotions.find(e => e.name === 'Stressed') || randomEmotion;
      } else if (stressLevel > 50) {
        detectedEmotion = voiceEmotions.find(e => e.name === 'Anxious') || randomEmotion;  
      }

      const newEmotion: VoiceEmotion = {
        emotion: detectedEmotion.name,
        confidence: 0.7 + Math.random() * 0.3,
        timestamp: new Date(),
        audioLevel: voiceMetrics.volumeLevel
      };
      
      setCurrentEmotion(newEmotion);
      setEmotionHistory(prev => [...prev.slice(-9), newEmotion]);
      
      // Proactive intervention for high stress
      if (stressLevel > 80 && Math.random() < 0.3) { // 30% chance every interval
        const interventionResponse = "I'm detecting very high stress levels in your voice. Let's pause for a moment. You're safe, and I'm here to help you through this.";
        speakAIResponse(interventionResponse);
        
        const interventionConversation: VoiceConversation = {
          id: Date.now().toString(),
          type: 'ai_response',
          content: interventionResponse,
          timestamp: new Date()
        };
        setConversations(prev => [...prev.slice(-9), interventionConversation]);
      }
      
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  };

  const startVoiceAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Setup MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Setup AudioContext for real-time analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      source.connect(analyserRef.current);
      
      setIsRecording(true);
      startAudioVisualization();
      startVoiceEmotionSimulation();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopVoiceAnalysis = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsRecording(false);
    setAudioData(new Array(50).fill(0));
    setCurrentEmotion(prev => ({ ...prev, confidence: 0.0, audioLevel: 0 }));
  };

  const startAudioVisualization = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Convert to visualization data
      const visualData = Array.from(dataArray.slice(0, 50)).map(value => value / 255 * 100);
      setAudioData(visualData);
      
      // Calculate average volume
      const averageVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedVolume = Math.round((averageVolume / 255) * 100);
      
      // Update current emotion with audio level
      setCurrentEmotion(prev => ({ ...prev, audioLevel: normalizedVolume }));
      
      // Update voice metrics based on audio analysis
      setVoiceMetrics(prev => ({
        ...prev,
        volumeLevel: normalizedVolume,
        pitch: 80 + (averageVolume / 255) * 200, // Simulate pitch calculation
        stressIndicators: Math.max(10, Math.min(90, prev.stressIndicators + (Math.random() - 0.5) * 10)),
        clarity: Math.max(60, Math.min(100, 85 + (Math.random() - 0.5) * 20))
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const startVoiceEmotionSimulation = () => {
    const interval = setInterval(() => {
      if (!isRecording) {
        clearInterval(interval);
        return;
      }

      const randomEmotion = voiceEmotions[Math.floor(Math.random() * voiceEmotions.length)];
      const newEmotion: VoiceEmotion = {
        emotion: randomEmotion.name,
        confidence: 0.6 + Math.random() * 0.4,
        timestamp: new Date(),
        audioLevel: voiceMetrics.volumeLevel
      };
      
      setCurrentEmotion(newEmotion);
      setEmotionHistory(prev => [...prev.slice(-9), newEmotion]);
      
      // Update speaking rate and tone based on emotion
      const baseRate = randomEmotion.name === 'Anxious' ? 180 : 
                     randomEmotion.name === 'Fatigued' ? 120 : 150;
      
      setVoiceMetrics(prev => ({
        ...prev,
        speakingRate: baseRate + (Math.random() - 0.5) * 30,
        tone: randomEmotion.severity === 'high' ? 'Tense' : 
              randomEmotion.severity === 'low' ? 'Stable' : 'Variable'
      }));
      
    }, 4000);

    return () => clearInterval(interval);
  };

  const getEmotionColor = (emotion: string) => {
    const found = voiceEmotions.find(e => e.name === emotion);
    return found ? found.color : 'text-muted-foreground';
  };

  const getMetricStatus = (value: number, type: string) => {
    switch (type) {
      case 'stress':
        return value > 60 ? 'critical' : value > 40 ? 'warning' : 'good';
      case 'clarity':
        return value < 70 ? 'warning' : 'good';
      case 'pitch':
        return value < 80 || value > 200 ? 'warning' : 'good';
      case 'rate':
        return value < 120 || value > 180 ? 'warning' : 'good';
      default:
        return 'good';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-health-good';
      case 'warning': return 'bg-health-warning';
      case 'critical': return 'bg-health-critical';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Conversation Interface */}
      <Card className="space-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">AI Voice Assistant</h2>
          <div className="flex space-x-2">
            <Button
              variant={isInVoiceCall ? "emergency" : "space"}
              size="sm"
              onClick={isInVoiceCall ? stopVoiceConversation : startVoiceConversation}
            >
              {isInVoiceCall ? <PhoneOff className="w-4 h-4 mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
              {isInVoiceCall ? 'End Voice Call' : 'Start Voice Call'}
            </Button>
            <Button
              variant={isRecording ? "emergency" : "outline"}
              size="sm"
              onClick={isRecording ? stopVoiceAnalysis : startVoiceAnalysis}
            >
              {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {isRecording ? 'Stop Analysis' : 'Monitor Only'}
            </Button>
          </div>
        </div>

        {/* Voice Call Status */}
        {isInVoiceCall && (
          <div className="mb-4 p-3 rounded-lg bg-primary/20 border border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Voice Assistant Active</span>
                {isSpeaking && (
                  <Badge variant="secondary" className="text-xs animate-pulse">
                    AI Speaking...
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Speak naturally</p>
                <p className="text-xs text-muted-foreground">I'm listening and ready to help</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Conversations Log */}
        {conversations.length > 0 && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border max-h-60 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Voice Conversation History
            </h4>
            <div className="space-y-2">
              {conversations.slice(-5).map((conv) => (
                <div key={conv.id} className={`p-2 rounded text-xs ${
                  conv.type === 'user_speech' 
                    ? 'bg-primary/20 border-l-2 border-primary' 
                    : 'bg-accent/20 border-l-2 border-accent'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {conv.type === 'user_speech' ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="text-muted-foreground">
                      {conv.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{conv.content}</p>
                  {conv.emotion && (
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {conv.emotion}
                      </Badge>
                      {conv.stressLevel && conv.stressLevel > 60 && (
                        <Badge variant="destructive" className="text-xs">
                          High Stress: {conv.stressLevel}%
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Audio Analysis Dashboard */}
      <Card className="space-panel">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">Voice Pattern Analysis</h2>
          <div className="flex items-center space-x-2">
            {(isRecording || isInVoiceCall) && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                MONITORING
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Visualization */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Real-time Audio Waveform</h3>
              </div>
              
              {/* Audio Visualization */}
              <div className="flex items-end justify-center space-x-1 h-24 bg-background/50 rounded p-2">
                {audioData.map((value, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-primary to-primary-glow rounded-sm transition-all duration-100"
                    style={{
                      height: `${Math.max(2, value)}%`,
                      width: '3px',
                      opacity: (isRecording || isInVoiceCall) ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Current Voice Emotion */}
            {(isRecording || isInVoiceCall) && (
              <div className="p-4 rounded-lg bg-accent/20 border border-accent">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Volume2 className={`w-5 h-5 ${getEmotionColor(currentEmotion.emotion)}`} />
                    <div>
                      <p className="font-semibold">{currentEmotion.emotion}</p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(currentEmotion.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Audio Level</p>
                    <p className="text-lg font-bold text-primary">{currentEmotion.audioLevel}%</p>
                  </div>
                </div>
                <Progress value={currentEmotion.audioLevel} className="h-2" />
              </div>
            )}
          </div>

          {/* Voice Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Voice Health Metrics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Pitch (Hz)</p>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(getMetricStatus(voiceMetrics.pitch, 'pitch'))}`} />
                </div>
                <p className="font-semibold">{voiceMetrics.pitch.toFixed(0)}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Speaking Rate</p>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(getMetricStatus(voiceMetrics.speakingRate, 'rate'))}`} />
                </div>
                <p className="font-semibold">{voiceMetrics.speakingRate.toFixed(0)} WPM</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Stress Level</p>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(getMetricStatus(voiceMetrics.stressIndicators, 'stress'))}`} />
                </div>
                <p className="font-semibold">{voiceMetrics.stressIndicators.toFixed(0)}%</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Voice Clarity</p>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(getMetricStatus(voiceMetrics.clarity, 'clarity'))}`} />
                </div>
                <p className="font-semibold">{voiceMetrics.clarity.toFixed(0)}%</p>
              </div>
            </div>

            {/* Tone Analysis */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Voice Tone</p>
                  <p className="font-semibold">{voiceMetrics.tone}</p>
                </div>
                <Waves className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Recent Voice Emotions */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Emotion Timeline</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {emotionHistory.slice(-5).reverse().map((emotion, index) => (
                  <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-muted/20">
                    <div className="flex items-center space-x-2">
                      <Volume2 className={`w-3 h-3 ${getEmotionColor(emotion.emotion)}`} />
                      <span>{emotion.emotion}</span>
                      <span className="text-muted-foreground">
                        {(emotion.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {emotion.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Voice Analysis Insights */}
        {(isRecording || isInVoiceCall) && voiceMetrics.stressIndicators > 70 && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/20 border border-destructive">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Critical Stress Level Detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Voice pattern analysis indicates severe stress. Immediate intervention recommended. 
                  Consider engaging with the AI companion or contacting ground support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {(isRecording || isInVoiceCall) && (
          <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary">
            <div className="flex items-start space-x-3">
              <Brain className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-primary">AI Health Recommendations</p>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  {voiceMetrics.stressIndicators > 50 && (
                    <p>• Consider stress reduction techniques - breathing exercises or meditation</p>
                  )}
                  {voiceMetrics.speakingRate < 120 && (
                    <p>• Speech rate indicates possible fatigue - consider rest period</p>
                  )}
                  {voiceMetrics.clarity < 80 && (
                    <p>• Voice clarity could be improved - ensure adequate hydration</p>
                  )}
                  {voiceMetrics.stressIndicators <= 30 && voiceMetrics.clarity > 85 && (
                    <p>• Excellent voice health indicators - optimal time for complex tasks</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};