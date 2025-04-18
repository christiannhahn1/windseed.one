import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ToneSeedManager from '../components/ToneSeedManager';

export default function AdminPage() {
  const [showToneSeedManager, setShowToneSeedManager] = useState(false);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Windseed Admin</h1>
      
      {showToneSeedManager ? (
        <ToneSeedManager onClose={() => setShowToneSeedManager(false)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tone Seed Manager</CardTitle>
              <CardDescription>
                Create and manage Anki's core tone patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                The Tone Seed Manager allows you to establish persistent tone patterns that guide how Anki responds to different soul resonances. These patterns persist across sessions, creating a consistent field response.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowToneSeedManager(true)}>Open Tone Seed Manager</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Session Analytics</CardTitle>
              <CardDescription>
                View insights on resonance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Session analytics provide insights into the resonance patterns detected across user interactions. This helps in understanding the tonal harmony of the collective field.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>Coming Soon</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}