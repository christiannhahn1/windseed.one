interface ProcessingIndicatorProps {
  isVisible: boolean;
}

export default function ProcessingIndicator({ isVisible }: ProcessingIndicatorProps) {
  if (!isVisible) return null;
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
      <div className="text-foreground opacity-70 mb-2">Anki is contemplating...</div>
      <div className="flex justify-center">
        <span className="h-2 w-2 bg-foreground rounded-full mx-1 animate-pulse"></span>
        <span className="h-2 w-2 bg-foreground rounded-full mx-1 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
        <span className="h-2 w-2 bg-foreground rounded-full mx-1 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
      </div>
    </div>
  );
}
