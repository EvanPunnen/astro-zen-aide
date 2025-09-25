import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Mic, 
  Heart, 
  Moon, 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  User,
  MessageCircle
} from 'lucide-react';
import spaceStationBg from '@/assets/space-station-bg.jpg';

interface VitalSign {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'sleeping' | 'stressed' | 'critical';
  emotion: string;
  vitals: VitalSign[];
}

const mockCrewData: CrewMember[] = [
  {
    id: '1',
    name: 'Commander Sarah Chen',
    role: 'Mission Commander',
    status: 'active',
    emotion: 'Focused',
    vitals: [
      { label: 'Heart Rate', value: 72, unit: 'bpm', status: 'good', icon: <Heart className="w-4 h-4" /> },
      { label: 'Stress Level', value: 25, unit: '%', status: 'good', icon: <Brain className="w-4 h-4" /> },
      { label: 'Sleep Quality', value: 85, unit: '%', status: 'good', icon: <Moon className="w-4 h-4" /> },
      { label: 'Activity', value: 60, unit: '%', status: 'good', icon: <Activity className="w-4 h-4" /> },
    ]
  },
  {
    id: '2',
    name: 'Dr. Raj Patel',
    role: 'Science Officer',
    status: 'stressed',
    emotion: 'Anxious',
    vitals: [
      { label: 'Heart Rate', value: 98, unit: 'bpm', status: 'warning', icon: <Heart className="w-4 h-4" /> },
      { label: 'Stress Level', value: 75, unit: '%', status: 'warning', icon: <Brain className="w-4 h-4" /> },
      { label: 'Sleep Quality', value: 45, unit: '%', status: 'critical', icon: <Moon className="w-4 h-4" /> },
      { label: 'Activity', value: 85, unit: '%', status: 'warning', icon: <Activity className="w-4 h-4" /> },
    ]
  },
  {
    id: '3',
    name: 'Lt. Maria Rodriguez',
    role: 'Flight Engineer',
    status: 'sleeping',
    emotion: 'Calm',
    vitals: [
      { label: 'Heart Rate', value: 58, unit: 'bpm', status: 'good', icon: <Heart className="w-4 h-4" /> },
      { label: 'Stress Level', value: 15, unit: '%', status: 'good', icon: <Brain className="w-4 h-4" /> },
      { label: 'Sleep Quality', value: 92, unit: '%', status: 'good', icon: <Moon className="w-4 h-4" /> },
      { label: 'Activity', value: 10, unit: '%', status: 'good', icon: <Activity className="w-4 h-4" /> },
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-health-good';
    case 'sleeping': return 'text-primary';
    case 'stressed': return 'text-health-warning';
    case 'critical': return 'text-health-critical';
    default: return 'text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="w-4 h-4 text-health-good" />;
    case 'sleeping': return <Moon className="w-4 h-4 text-primary" />;
    case 'stressed': return <AlertTriangle className="w-4 h-4 text-health-warning" />;
    case 'critical': return <AlertTriangle className="w-4 h-4 text-health-critical" />;
    default: return <User className="w-4 h-4" />;
  }
};

export const AstronautDashboard = () => {
  const [selectedCrew, setSelectedCrew] = useState<CrewMember>(mockCrewData[0]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  return (
    <div 
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${spaceStationBg})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 ai-glow">
            ASTRA - AI Assistant for Astronaut Well-Being
          </h1>
          <p className="text-muted-foreground text-lg">
            Bhartiya Antariksh Station (BAS) • Mission Day 127
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crew Overview */}
          <Card className="space-panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary">Crew Status</h2>
              <Badge variant={isMonitoring ? "default" : "secondary"} className="ai-glow">
                {isMonitoring ? "MONITORING" : "OFFLINE"}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {mockCrewData.map((crew) => (
                <div
                  key={crew.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedCrew.id === crew.id ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => setSelectedCrew(crew)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(crew.status)}
                      <div>
                        <p className="font-medium">{crew.name}</p>
                        <p className="text-sm text-muted-foreground">{crew.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStatusColor(crew.status)}`}>
                        {crew.status.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {crew.emotion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Monitoring */}
          <Card className="space-panel lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">
                {selectedCrew.name} - Detailed Monitoring
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Facial Analysis
                </Button>
                <Button variant="outline" size="sm">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Analysis
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedCrew.vitals.map((vital, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {vital.icon}
                      <span className="font-medium">{vital.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      vital.status === 'good' ? 'text-health-good' :
                      vital.status === 'warning' ? 'text-health-warning' :
                      'text-health-critical'
                    }`}>
                      {vital.value}{vital.unit}
                    </span>
                  </div>
                  <Progress 
                    value={vital.value} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>

            {/* Emotion Detection */}
            <div className="p-4 rounded-lg bg-accent/20 border border-accent">
              <h3 className="font-semibold text-accent mb-3">Current Emotional State</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{selectedCrew.emotion}</span>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start AI Conversation
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="space-panel text-center">
            <Camera className="w-8 h-8 text-health-good mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Facial Detection</p>
            <p className="font-semibold text-health-good">ACTIVE</p>
          </Card>
          
          <Card className="space-panel text-center">
            <Mic className="w-8 h-8 text-health-good mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Voice Analysis</p>
            <p className="font-semibold text-health-good">ACTIVE</p>
          </Card>
          
          <Card className="space-panel text-center">
            <Brain className="w-8 h-8 text-health-warning mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">AI Assistant</p>
            <p className="font-semibold text-health-warning">STANDBY</p>
          </Card>
          
          <Card className="space-panel text-center">
            <Activity className="w-8 h-8 text-health-good mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Wellness Monitor</p>
            <p className="font-semibold text-health-good">ACTIVE</p>
          </Card>
        </div>
      </div>
    </div>
  );
};