import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Mic
} from 'lucide-react';

interface CombinedEmotion {
  overall: string;
  facial: string;
  voice: string;
  confidence: number;
  alignment: 'high' | 'medium' | 'low';
}

interface WellbeingScore {
  physical: number;
  mental: number;
  overall: number;
  trend: 'improving' | 'stable' | 'declining';
}

export const CombinedAnalysis = () => {
  const [combinedEmotion, setCombinedEmotion] = useState<CombinedEmotion>({
    overall: 'Focused',
    facial: 'Neutral',
    voice: 'Calm',
    confidence: 0.85,
    alignment: 'high'
  });

  const [wellbeingScore, setWellbeingScore] = useState<WellbeingScore>({
    physical: 78,
    mental: 82,
    overall: 80,
    trend: 'stable'
  });

  const [recommendations, setRecommendations] = useState<string[]>([
    'Maintain current focus levels during critical operations',
    'Consider a short break in the next 30 minutes',
    'Hydration levels appear optimal'
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update combined emotion analysis
      const emotions = ['Focused', 'Calm', 'Alert', 'Stressed', 'Fatigued'];
      const facialEmotions = ['Happy', 'Neutral', 'Focused', 'Stressed'];
      const voiceEmotions = ['Calm', 'Excited', 'Focused', 'Anxious'];
      
      const newOverall = emotions[Math.floor(Math.random() * emotions.length)];
      const newFacial = facialEmotions[Math.floor(Math.random() * facialEmotions.length)];
      const newVoice = voiceEmotions[Math.floor(Math.random() * voiceEmotions.length)];
      
      // Calculate alignment based on emotion similarity
      const getAlignment = () => {
        if (newOverall === newFacial || newOverall === newVoice) return 'high';
        if (newFacial === newVoice) return 'medium';
        return 'low';
      };

      setCombinedEmotion({
        overall: newOverall,
        facial: newFacial,
        voice: newVoice,
        confidence: 0.7 + Math.random() * 0.3,
        alignment: getAlignment()
      });

      // Update wellbeing scores
      setWellbeingScore(prev => {
        const physicalChange = (Math.random() - 0.5) * 5;
        const mentalChange = (Math.random() - 0.5) * 5;
        const newPhysical = Math.max(0, Math.min(100, prev.physical + physicalChange));
        const newMental = Math.max(0, Math.min(100, prev.mental + mentalChange));
        const newOverall = (newPhysical + newMental) / 2;
        
        const trend = newOverall > prev.overall ? 'improving' : 
                     newOverall < prev.overall ? 'declining' : 'stable';

        return {
          physical: newPhysical,
          mental: newMental,
          overall: newOverall,
          trend
        };
      });

      // Update recommendations based on current state
      const newRecommendations = [];
      if (newOverall === 'Stressed') {
        newRecommendations.push('High stress detected - consider breathing exercises');
      }
      if (newOverall === 'Fatigued') {
        newRecommendations.push('Fatigue indicators present - schedule rest period');
      }
      if (wellbeingScore.physical < 70) {
        newRecommendations.push('Physical wellbeing below threshold - check vitals');
      }
      if (wellbeingScore.mental < 70) {
        newRecommendations.push('Mental wellbeing needs attention - engage AI companion');
      }
      if (newRecommendations.length === 0) {
        newRecommendations.push('All systems nominal - maintain current routine');
      }
      
      setRecommendations(newRecommendations);
      
    }, 5000);

    return () => clearInterval(interval);
  }, [wellbeingScore.physical, wellbeingScore.mental, wellbeingScore.overall]);

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'high': return 'text-health-good';
      case 'medium': return 'text-health-warning';
      case 'low': return 'text-health-critical';
      default: return 'text-muted-foreground';
    }
  };

  const getAlignmentBadge = (alignment: string) => {
    switch (alignment) {
      case 'high': return <Badge variant="default" className="bg-health-good">High Alignment</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-health-warning text-black">Medium Alignment</Badge>;
      case 'low': return <Badge variant="destructive">Low Alignment</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-health-good" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-health-critical" />;
      case 'stable': return <Activity className="w-4 h-4 text-primary" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-health-good';
    if (score >= 60) return 'text-health-warning';
    return 'text-health-critical';
  };

  return (
    <div className="space-y-6">
      {/* Combined Emotion Analysis */}
      <Card className="space-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">Multimodal Emotion Analysis</h2>
          {getAlignmentBadge(combinedEmotion.alignment)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
            <Brain className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Overall State</p>
            <p className="font-bold text-lg">{combinedEmotion.overall}</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
            <Eye className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="text-sm text-muted-foreground">Facial Analysis</p>
            <p className="font-bold text-lg">{combinedEmotion.facial}</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted/30 border border-border">
            <Mic className="w-8 h-8 mx-auto mb-2 text-secondary-foreground" />
            <p className="text-sm text-muted-foreground">Voice Analysis</p>
            <p className="font-bold text-lg">{combinedEmotion.voice}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Analysis Confidence</span>
            <span className="text-sm font-bold">{(combinedEmotion.confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={combinedEmotion.confidence * 100} className="h-2" />
        </div>
      </Card>

      {/* Wellbeing Scores */}
      <Card className="space-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">Wellbeing Assessment</h2>
          <div className="flex items-center space-x-2">
            {getTrendIcon(wellbeingScore.trend)}
            <span className="text-sm text-muted-foreground capitalize">{wellbeingScore.trend}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-muted/30">
                <div 
                  className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center transition-all duration-1000"
                  style={{
                    background: `conic-gradient(from 0deg, hsl(var(--primary)) ${wellbeingScore.physical * 3.6}deg, hsl(var(--muted)) ${wellbeingScore.physical * 3.6}deg)`
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Physical Health</p>
            <p className={`font-bold text-2xl ${getScoreColor(wellbeingScore.physical)}`}>
              {wellbeingScore.physical.toFixed(0)}%
            </p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-muted/30">
                <div 
                  className="w-full h-full rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center transition-all duration-1000"
                  style={{
                    background: `conic-gradient(from 0deg, hsl(var(--accent)) ${wellbeingScore.mental * 3.6}deg, hsl(var(--muted)) ${wellbeingScore.mental * 3.6}deg)`
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                    <Brain className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Mental Health</p>
            <p className={`font-bold text-2xl ${getScoreColor(wellbeingScore.mental)}`}>
              {wellbeingScore.mental.toFixed(0)}%
            </p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <div className="w-full h-full rounded-full bg-muted/30">
                <div 
                  className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-primary-glow flex items-center justify-center transition-all duration-1000"
                  style={{
                    background: `conic-gradient(from 0deg, hsl(var(--primary)) ${wellbeingScore.overall * 3.6}deg, hsl(var(--muted)) ${wellbeingScore.overall * 3.6}deg)`
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className={`font-bold text-2xl ${getScoreColor(wellbeingScore.overall)}`}>
              {wellbeingScore.overall.toFixed(0)}%
            </p>
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className="space-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">AI Recommendations</h2>
          <CheckCircle className="w-5 h-5 text-health-good" />
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20 border border-border">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm">{rec}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="space" className="w-full">
            <Brain className="w-4 h-4 mr-2" />
            Generate Detailed Report
          </Button>
        </div>
      </Card>
    </div>
  );
};