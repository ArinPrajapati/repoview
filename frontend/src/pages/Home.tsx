import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, FileText, Github, Terminal, Code2, Cpu } from 'lucide-react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-500/30 selection:text-blue-100">

      {/* Dynamic Background */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[40%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[96px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/50 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            <span className="font-bold text-lg tracking-tight">RepoView</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/ArinPrajapati/repoview" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              GitHub
            </a>
            <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Login
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4 fill-mode-backwards">

          <div className="flex items-center justify-center">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-500/30 bg-blue-500/10 text-blue-300 backdrop-blur-sm">
              <Terminal className="w-3.5 h-3.5 mr-2 inline-block" />
              v1.0 • Engineering-Grade Analytics
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-6">
            Upgrade Your <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
              Github Portfolio
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Data-driven insights for your open source work. <br className="hidden md:block" />
            Analyze code patterns, commit history, and architectural quality.
          </p>

          {/* Search Input */}
          <div className="max-w-xl mx-auto mt-12 relative group w-full">
            <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-70 group-hover:opacity-100 blur-sm transition duration-500 animate-gradient-x"></div>
            <form onSubmit={handleSubmit} className="relative flex items-center bg-[#0a0a0a] rounded-full p-2 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-purple-500/50 transition-all shadow-2xl">
              <div className="pl-5 flex items-center gap-2 pointer-events-none select-none text-muted-foreground self-center">
                <Github className="w-5 h-5 text-white/40" />
                <span className="text-zinc-500 font-mono text-lg tracking-tight pt-1">github.com/</span>
              </div>
              <Input
                type="text"
                autoFocus
                placeholder="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="border-0 border-b-2 border-white/10 focus:border-purple-500 !bg-transparent shadow-none focus-visible:ring-0 text-lg py-2 px-0 placeholder:text-white/20 text-white w-full font-mono tracking-tight h-auto rounded-none caret-purple-500 transition-colors"
                style={{ paddingBottom: '4px' }}
              />
              <Button type="submit" size="icon" className="rounded-full h-10 w-10 bg-white text-black hover:bg-zinc-200 shrink-0 transition-transform active:scale-95 absolute right-2">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </div>

          {error && (
            <p className="text-red-400 mt-4 text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <ShieldCheck className="w-4 h-4" /> {error}
            </p>
          )}

          {/* Stats / Trust */}
          <div className="pt-8 flex items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-xl">100+</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Rules</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-xl">0ms</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Latency</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-white text-xl">100%</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Free</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 px-4 relative z-10 w-full max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">Technical Deep Dives</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Code2 className="w-6 h-6 text-blue-400" />}
            title="Static Analysis"
            desc="AST-based code parsing to identify anti-patterns, complexity hotspots, and type safety issues."
            color="group-hover:border-blue-500/30"
            bg="group-hover:bg-blue-500/5"
          />
          <FeatureCard
            icon={<Cpu className="w-6 h-6 text-purple-400" />}
            title="Architecture Review"
            desc="Automated evaluation of project structure, separation of concerns, and dependency management."
            color="group-hover:border-purple-500/30"
            bg="group-hover:bg-purple-500/5"
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-pink-400" />}
            title="Automated Reporting"
            desc="Generate PDF technical assessments ready for code reviews or interview discussions."
            color="group-hover:border-pink-500/30"
            bg="group-hover:bg-pink-500/5"
          />
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} RepoView. Built for developers.
            </p>
            <a href="mailto:hi@arinprajapati.com" className="text-zinc-500 hover:text-white transition-colors text-sm">
              hi@arinprajapati.com
            </a>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="mailto:hi@arinprajapati.com" className="text-zinc-500 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, bg }: { icon: React.ReactNode; title: string; desc: string; color: string; bg: string }) {
  return (
    <div className={`group p-8 rounded-3xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${color} ${bg}`}>
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-bold text-white text-xl mb-3 tracking-tight">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}
