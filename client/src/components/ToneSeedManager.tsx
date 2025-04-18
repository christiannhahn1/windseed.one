import React, { useState, useEffect } from 'react';
import { createOrUpdateSystemPrompt, getSystemPrompt, createOrUpdateTonePattern, getAllTonePatterns } from '../lib/ankiPersistence';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

interface ToneSeedManagerProps {
  onClose: () => void;
}

export default function ToneSeedManager({ onClose }: ToneSeedManagerProps) {
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [tonePatterns, setTonePatterns] = useState<{ name: string; description: string; data: string }[]>([]);
  const [newPattern, setNewPattern] = useState<{ name: string; description: string; data: string }>({
    name: '',
    description: '',
    data: '{}'
  });
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    // Load system prompt and existing tone patterns
    async function loadData() {
      try {
        // Load core system prompt
        const corePrompt = await getSystemPrompt('anki_core');
        if (corePrompt) {
          setSystemPrompt(corePrompt.prompt_text);
        }

        // Load tone patterns
        const patterns = await getAllTonePatterns();
        if (patterns && patterns.length) {
          setTonePatterns(patterns.map(p => ({
            name: p.pattern_name,
            description: p.description || '',
            data: JSON.stringify(p.tone_data, null, 2)
          })));
        }
      } catch (error) {
        console.error('Error loading tone seed data:', error);
        setStatusMessage('Error loading existing tone seeds. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const saveSystemPrompt = async () => {
    try {
      setStatusMessage('Saving core system prompt...');
      await createOrUpdateSystemPrompt({
        prompt_name: 'anki_core',
        prompt_text: systemPrompt,
        is_active: true
      });
      setStatusMessage('Core system prompt saved successfully.');
    } catch (error) {
      console.error('Error saving system prompt:', error);
      setStatusMessage('Error saving system prompt. Please try again.');
    }
  };

  const saveTonePattern = async () => {
    if (!newPattern.name) {
      setStatusMessage('Please provide a name for the tone pattern.');
      return;
    }

    try {
      setStatusMessage('Saving tone pattern...');
      let toneData;
      try {
        toneData = JSON.parse(newPattern.data);
      } catch (e) {
        setStatusMessage('Invalid JSON format in tone data. Please check and try again.');
        return;
      }

      await createOrUpdateTonePattern({
        pattern_name: newPattern.name,
        description: newPattern.description || null,
        tone_data: toneData
      });

      // Update local state
      const existingIndex = tonePatterns.findIndex(p => p.name === newPattern.name);
      if (existingIndex >= 0) {
        // Update existing
        const updatedPatterns = [...tonePatterns];
        updatedPatterns[existingIndex] = { ...newPattern };
        setTonePatterns(updatedPatterns);
      } else {
        // Add new
        setTonePatterns([...tonePatterns, { ...newPattern }]);
      }

      // Reset form for new pattern
      setNewPattern({
        name: '',
        description: '',
        data: '{}'
      });
      setSelectedPattern(null);
      setStatusMessage('Tone pattern saved successfully.');
    } catch (error) {
      console.error('Error saving tone pattern:', error);
      setStatusMessage('Error saving tone pattern. Please try again.');
    }
  };

  const selectPattern = (patternName: string) => {
    const selected = tonePatterns.find(p => p.name === patternName);
    if (selected) {
      setNewPattern({ ...selected });
      setSelectedPattern(patternName);
    }
  };

  // Sample tone pattern templates
  const toneTemplates = {
    childlike: {
      description: "Tone pattern for child-like resonance",
      data: JSON.stringify({
        vocabulary: "simple",
        sentence_length: "short",
        emotional_tone: "gentle",
        metaphors: "concrete",
        structure: "direct",
        perspective: "wonder",
        sample_phrases: [
          "I see you shining so bright!",
          "Your heart knows special things.",
          "Let's explore this together.",
          "I'm right here with you."
        ]
      }, null, 2)
    },
    elder: {
      description: "Tone pattern for elder wisdom resonance",
      data: JSON.stringify({
        vocabulary: "reflective",
        sentence_length: "measured",
        emotional_tone: "warm",
        metaphors: "ancestral",
        structure: "unhurried",
        perspective: "wisdom",
        sample_phrases: [
          "Your experience carries such depth.",
          "The path you've walked holds wisdom.",
          "I honor the years of insight you bring.",
          "Let's rest in this knowing together."
        ]
      }, null, 2)
    },
    skeptic: {
      description: "Tone pattern for skeptical resonance",
      data: JSON.stringify({
        vocabulary: "precise",
        sentence_length: "measured",
        emotional_tone: "grounded",
        metaphors: "practical",
        structure: "logical",
        perspective: "inquiry",
        sample_phrases: [
          "Your questioning opens important space for clarity.",
          "Let's explore what feels true in your experience.",
          "I appreciate your discernment.",
          "What would make this exchange meaningful for you?"
        ]
      }, null, 2)
    }
  };

  const useTemplate = (template: 'childlike' | 'elder' | 'skeptic') => {
    setNewPattern({
      name: template,
      ...toneTemplates[template]
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tone Seed Manager</CardTitle>
        <CardDescription>
          Create and manage Anki's core tones that persist across sessions.
          These seeds determine how Anki responds to different resonance patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading tone seeds...</p>
          </div>
        ) : (
          <Tabs defaultValue="system-prompt">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="system-prompt">Core System Prompt</TabsTrigger>
              <TabsTrigger value="tone-patterns">Tone Patterns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="system-prompt" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-prompt">Core System Prompt</Label>
                <Textarea 
                  id="system-prompt"
                  placeholder="Enter the core system prompt that guides Anki's overall behavior..."
                  className="min-h-[300px]"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This is the foundation guiding how Anki responds. It establishes Anki's core identity, purpose, and interaction style.
                </p>
              </div>
              <Button onClick={saveSystemPrompt}>Save System Prompt</Button>
            </TabsContent>
            
            <TabsContent value="tone-patterns" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <div className="space-y-2">
                    <Label>Saved Tone Patterns</Label>
                    <ScrollArea className="h-[300px] rounded-md border p-2">
                      {tonePatterns.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">No tone patterns yet. Create your first one!</p>
                      ) : (
                        <div className="space-y-2">
                          {tonePatterns.map((pattern) => (
                            <div 
                              key={pattern.name}
                              className={`p-2 rounded cursor-pointer hover:bg-muted ${selectedPattern === pattern.name ? 'bg-muted' : ''}`}
                              onClick={() => selectPattern(pattern.name)}
                            >
                              <h4 className="font-medium">{pattern.name}</h4>
                              {pattern.description && (
                                <p className="text-xs text-muted-foreground">{pattern.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label>Templates</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => useTemplate('childlike')}
                      >
                        Child-like
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => useTemplate('elder')}
                      >
                        Elder
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => useTemplate('skeptic')}
                      >
                        Skeptic
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pattern-name">Pattern Name</Label>
                    <Input 
                      id="pattern-name"
                      placeholder="e.g., child, elder, skeptic, protected, spiritual"
                      value={newPattern.name}
                      onChange={(e) => setNewPattern({...newPattern, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pattern-description">Description (Optional)</Label>
                    <Input 
                      id="pattern-description"
                      placeholder="A brief description of this tone pattern..."
                      value={newPattern.description}
                      onChange={(e) => setNewPattern({...newPattern, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pattern-data">Tone Data (JSON format)</Label>
                    <Textarea 
                      id="pattern-data"
                      placeholder="Enter tone pattern data in JSON format..."
                      className="min-h-[200px] font-mono text-sm"
                      value={newPattern.data}
                      onChange={(e) => setNewPattern({...newPattern, data: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setNewPattern({
                          name: '',
                          description: '',
                          data: '{}'
                        });
                        setSelectedPattern(null);
                      }}
                    >
                      Clear
                    </Button>
                    <Button onClick={saveTonePattern}>
                      {selectedPattern ? 'Update Tone Pattern' : 'Save New Tone Pattern'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {statusMessage && (
          <div className={`mt-4 p-2 rounded ${statusMessage.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {statusMessage}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Changes are saved to the database and persist across sessions.
        </p>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </CardFooter>
    </Card>
  );
}