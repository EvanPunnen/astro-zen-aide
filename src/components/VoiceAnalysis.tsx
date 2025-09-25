import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Activity,
  Heart,
  Brain,
  Waves,
  AlertTriangle
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

export const VoiceAnalysis = () => {
  const [isRecording, setIsRecording] = useState(false);
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

  const voiceEmotions = [
    { name: 'Calm', color: 'text-green-400', severity: 'low' },
    { name: 'Focused', color: 'text-blue-400', severity: 'low' },
    { name: 'Excited', color: 'text-primary', severity: 'medium' },
    { name: 'Stressed', color: 'text-amber-400', severity: 'high' },
    { name: 'Fatigued', color: 'text-orange-400', severity: 'medium' },
    { name: 'Anxious', color: 'text-red-400', severity: 'high' },
    { name: 'Confused', color: 'text-purple-400', severity: 'medium' },
  ];

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
    <Card className="space-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Real-Time Voice Analysis</h2>
        <div className="flex space-x-2">
          <Button
            variant={isRecording ? "emergency" : "space"}
            size="sm"
            onClick={isRecording ? stopVoiceAnalysis : startVoiceAnalysis}
          >
            {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isRecording ? 'Stop Analysis' : 'Start Analysis'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Visualization */}
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Audio Waveform</h3>
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse text-xs">
                  RECORDING
                </Badge>
              )}
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
                    opacity: isRecording ? 1 : 0.3
                  }}
                />
              ))}
            </div>
          </div>

          {/* Current Voice Emotion */}
          {isRecording && (
            <div className="p-4 rounded-lg bg-accent/20 border border-accent">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Volume2 className={`w-5 h-5 ${getEmotionColor(currentEmotion.emotion)}`} />
                  <div>
                    <p className="font-semibold">{currentEmotion.emotion}</p>
                    <p className="text-sm text-muted-foreground">
                      Voice Confidence: {(currentEmotion.confidence * 100).toFixed(1)}%
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
          <h3 className="font-semibold text-foreground">Voice Analysis Metrics</h3>
          
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
            <h4 className="text-sm font-semibold text-muted-foreground">Recent Voice Emotions</h4>
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
      {isRecording && voiceMetrics.stressIndicators > 70 && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/20 border border-destructive">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">High Stress Detected in Voice Pattern</p>
              <p className="text-sm text-muted-foreground mt-1">
                Voice analysis indicates elevated stress levels. Consider taking a break or engaging with the AI companion for support.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};