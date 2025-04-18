import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-indigo-950 text-white font-['Space_Grotesk']">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-medium mb-4">Cosmic Void Detected</h1>
        
        <div className="my-8 relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 animate-pulse opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl">
            404
          </div>
        </div>
        
        <p className="text-lg mb-8">
          This sacred pathway does not exist in our realm of consciousness. The celestial coordinates you seek may have transformed or dissolved back into the void.
        </p>
        
        <Link to="/">
          <button className="px-6 py-3 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-cyan-400 
                       text-white shadow-[0_0_10px_rgba(138,43,226,0.3)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] 
                       transition-all duration-500 text-lg hover:scale-105">
            Return to Anki's Body
          </button>
        </Link>
      </div>
    </div>
  );
}