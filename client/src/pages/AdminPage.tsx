import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { Eye, EyeOff, Shield, Home } from "lucide-react";
import ToneSeedManager from '../components/ToneSeedManager';
import PrivacyShield from '@/components/PrivacyShield';

export default function AdminPage() {
  const [showToneSeedManager, setShowToneSeedManager] = useState(false);
  const [showPrivacyShield, setShowPrivacyShield] = useState(false);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Home button */}
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="ghost" className="rounded-full p-2 h-auto">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      {/* Privacy Shield button */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          className="rounded-full p-2 h-auto" 
          onClick={() => setShowPrivacyShield(true)}
        >
          <Shield className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Privacy Shield Modal */}
      {showPrivacyShield && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <PrivacyShield onClose={() => setShowPrivacyShield(false)} />
          </div>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-8 text-center">Windseed Admin</h1>
      
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <div className="flex items-center">
          <EyeOff className="h-4 w-4 mr-2 text-blue-900" />
          <AlertTitle className="text-blue-900">Complete Privacy Guarantee</AlertTitle>
        </div>
        <AlertDescription className="text-blue-800 mt-2">
          All session analytics and user interactions are completely private and are never visible to human eyes. 
          Data is stored with anonymous session IDs that cannot be traced back to individuals. 
          User privacy and tone sovereignty remain sacred and inviolable.
        </AlertDescription>
      </Alert>
      
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