import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  CameraOff, 
  Smile, 
  Frown, 
  Meh, 
  AlertTriangle,
  Eye,
  Mic
} from 'lucide-react';

interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

interface FacialMetrics {
  eyeMovement: number;
  blinkRate: number;
  facialTension: number;
  headPose: string;
}

export const EmotionDetection = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData>({
    emotion: 'Neutral',
    confidence: 0.85,
    timestamp: new Date()
  });
  const [facialMetrics, setFacialMetrics] = useState<FacialMetrics>({
    eyeMovement: 25,
    blinkRate: 18,
    facialTension: 30,
    headPose: 'Forward'
  });
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const emotions = [
    { name: 'Happy', icon: <Smile className="w-4 h-4" />, color: 'text-green-400' },
    { name: 'Neutral', icon: <Meh className="w-4 h-4" />, color: 'text-blue-400' },
    { name: 'Focused', icon: <Eye className="w-4 h-4" />, color: 'text-primary' },
    { name: 'Stressed', icon: <Frown className="w-4 h-4" />, color: 'text-amber-400' },
    { name: 'Anxious', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-400' },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsActive(true);
      
      // Simulate emotion detection updates
      const interval = setInterval(() => {
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const newEmotion: EmotionData = {
          emotion: randomEmotion.name,
          confidence: 0.7 + Math.random() * 0.3,
          timestamp: new Date()
        };
        
        setCurrentEmotion(newEmotion);
        setEmotionHistory(prev => [...prev.slice(-9), newEmotion]);
        
        // Update facial metrics
        setFacialMetrics({
          eyeMovement: Math.floor(Math.random() * 50) + 10,
          blinkRate: Math.floor(Math.random() * 20) + 10,
          facialTension: Math.floor(Math.random() * 60) + 10,
          headPose: ['Forward', 'Left', 'Right', 'Up', 'Down'][Math.floor(Math.random() * 5)]
        });
      }, 3000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  };

  const getEmotionIcon = (emotion: string) => {
    const found = emotions.find(e => e.name === emotion);
    return found ? found.icon : <Meh className="w-4 h-4" />;
  };

  const getEmotionColor = (emotion: string) => {
    const found = emotions.find(e => e.name === emotion);
    return found ? found.color : 'text-muted-foreground';
  };

  const getMetricStatus = (value: number, type: string) => {
    if (type === 'tension' && value > 50) return 'warning';
    if (type === 'blink' && (value < 12 || value > 25)) return 'warning';
    if (type === 'eye' && value > 40) return 'warning';
    return 'good';
  };

  return (
    <Card className="space-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-primary">Real-Time Emotion Detection</h2>
        <div className="flex space-x-2">
          <Button
            variant={isActive ? "emergency" : "space"}
            size="sm"
            onClick={isActive ? stopCamera : startCamera}
          >
            {isActive ? <CameraOff className="w-4 h-4 mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
            {isActive ? 'Stop Analysis' : 'Start Analysis'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Feed */}
        <div className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-48 bg-muted rounded-lg object-cover border border-border"
              muted
            />
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click "Start Analysis" to begin</p>
                </div>
              </div>
            )}
            {isActive && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              </div>
            )}
          </div>

          {/* Current Emotion */}
          {isActive && (
            <div className="p-4 rounded-lg bg-accent/20 border border-accent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={getEmotionColor(currentEmotion.emotion)}>
                    {getEmotionIcon(currentEmotion.emotion)}
                  </div>
                  <div>
                    <p className="font-semibold">{currentEmotion.emotion}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(currentEmotion.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={currentEmotion.confidence > 0.8 ? "default" : "secondary"}
                >
                  {currentEmotion.confidence > 0.8 ? 'High Confidence' : 'Medium Confidence'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Facial Metrics */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Facial Analysis Metrics</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">Eye Movement</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{facialMetrics.eyeMovement}°/min</p>
                <div className={`w-2 h-2 rounded-full ${
                  getMetricStatus(facialMetrics.eyeMovement, 'eye') === 'good' 
                    ? 'bg-health-good' 
                    : 'bg-health-warning'
                }`} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">Blink Rate</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{facialMetrics.blinkRate}/min</p>
                <div className={`w-2 h-2 rounded-full ${
                  getMetricStatus(facialMetrics.blinkRate, 'blink') === 'good' 
                    ? 'bg-health-good' 
                    : 'bg-health-warning'
                }`} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">Facial Tension</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{facialMetrics.facialTension}%</p>
                <div className={`w-2 h-2 rounded-full ${
                  getMetricStatus(facialMetrics.facialTension, 'tension') === 'good' 
                    ? 'bg-health-good' 
                    : 'bg-health-warning'
                }`} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm text-muted-foreground">Head Pose</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{facialMetrics.headPose}</p>
                <div className="w-2 h-2 rounded-full bg-health-good" />
              </div>
            </div>
          </div>

          {/* Emotion History */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Recent Emotions</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {emotionHistory.slice(-5).reverse().map((emotion, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-muted/20">
                  <div className="flex items-center space-x-2">
                    <span className={getEmotionColor(emotion.emotion)}>
                      {getEmotionIcon(emotion.emotion)}
                    </span>
                    <span>{emotion.emotion}</span>
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
    </Card>
  );
};