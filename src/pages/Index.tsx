import { AstronautDashboard } from "@/components/AstronautDashboard";
import { EmotionDetection } from "@/components/EmotionDetection";
import { VoiceAnalysis } from "@/components/VoiceAnalysis";
import { CombinedAnalysis } from "@/components/CombinedAnalysis";
import { AICompanion } from "@/components/AICompanion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6">
            <TabsList className="grid w-full max-w-4xl grid-cols-5 bg-muted/30">
              <TabsTrigger value="dashboard">Mission Control</TabsTrigger>
              <TabsTrigger value="emotion">Facial Analysis</TabsTrigger>
              <TabsTrigger value="voice">Voice Analysis</TabsTrigger>
              <TabsTrigger value="combined">AI Assessment</TabsTrigger>
              <TabsTrigger value="companion">AI Support</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <AstronautDashboard />
        </TabsContent>

        <TabsContent value="emotion" className="mt-0 p-6 max-w-7xl mx-auto">
          <EmotionDetection />
        </TabsContent>

        <TabsContent value="voice" className="mt-0 p-6 max-w-7xl mx-auto">
          <VoiceAnalysis />
        </TabsContent>

        <TabsContent value="combined" className="mt-0 p-6 max-w-7xl mx-auto">
          <CombinedAnalysis />
        </TabsContent>

        <TabsContent value="companion" className="mt-0 p-6 max-w-4xl mx-auto">
          <AICompanion />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
