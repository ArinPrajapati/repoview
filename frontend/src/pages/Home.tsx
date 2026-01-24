import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, FileText, BarChart2, Github } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a GitHub username');
      return;
    }
    navigate(`/analyze?user=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-500/30 bg-blue-500/10 text-blue-300 mb-6 backdrop-blur-sm">
          <ShieldCheck className="w-3.5 h-3.5 mr-2 inline-block" />
          No AI Used — 100% Transparent Rules
        </Badge>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4">
          Upgrade Your <br />
          <span className="text-gradient">Open Source Portfolio</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Evaluate your GitHub repositories with objective, rule-based analysis. 
          Get actionable feedback to improve your code quality and impress recruiters.
        </p>

        {/* Search Input */}
        <div className="max-w-md mx-auto mt-12 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
          <form onSubmit={handleSubmit} className="relative flex items-center bg-black rounded-full p-2 glass ring-1 ring-white/10">
            <div className="pl-4 text-muted-foreground">
              <Github className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="border-none bg-transparent shadow-none focus-visible:ring-0 text-lg py-6 px-4 placeholder:text-muted-foreground/50 h-auto"
            />
            <Button type="submit" size="icon" className="rounded-full h-12 w-12 bg-blue-600 hover:bg-blue-500 text-white shrink-0">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
        
        {error && (
          <p className="text-red-400 mt-3 text-sm font-medium animate-in slide-in-from-top-2">{error}</p>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <FeatureCard 
            icon={<BarChart2 className="w-6 h-6 text-blue-400" />}
            title="Objective Scoring"
            desc="130-point scoring system across 6 distinct categories like structure, tests, and best practices."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-purple-400" />}
            title="Transparent Checks"
            desc="We check for README quality, commit history, folder structure, and live deployments."
          />
          <FeatureCard 
            icon={<FileText className="w-6 h-6 text-pink-400" />}
            title="PDF Reports"
            desc="Export professional PDF reports of your analysis to attach to your resume."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
      <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-4 border border-white/5">
        {icon}
      </div>
      <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
