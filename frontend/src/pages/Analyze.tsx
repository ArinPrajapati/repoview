import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchRepos, type Repository } from '@/lib/api';
import { Search, Star, GitFork, AlertCircle, ArrowLeft, ArrowRight, Github } from 'lucide-react';

const FREE_TIER_LIMIT = 3;

export default function Analyze() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get('user') || '';

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    fetchRepos(username)
      .then(setRepos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username, navigate]);

  const toggleRepo = (name: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      if (newSelected.size >= FREE_TIER_LIMIT) {
        return; // Enforce limit
      }
      newSelected.add(name);
    }
    setSelected(newSelected);
  };

  const handleAnalyze = () => {
    if (selected.size === 0) return;
    const repoList = Array.from(selected).join(',');
    navigate(`/results?user=${encodeURIComponent(username)}&repos=${encodeURIComponent(repoList)}`);
  };

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md text-center border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Failed to load repos</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full border-red-500/20 hover:bg-red-500/10 hover:text-red-400">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 pt-12 max-w-7xl mx-auto">
      {/* Background Glow */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[128px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="text-muted-foreground hover:text-white flex items-center gap-2 mb-2 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Select Repositories</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Github className="w-4 h-4" />
            <span className="text-white font-medium">@{username}</span> • {repos.length} public repositories
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search repos..." 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          <Badge variant="outline" className={`px-4 py-2 rounded-full border bg-black/20 backdrop-blur-md ${selected.size >= FREE_TIER_LIMIT ? 'border-yellow-500/50 text-yellow-500' : 'border-white/10 text-muted-foreground'}`}>
            {selected.size} / {FREE_TIER_LIMIT} Selected
          </Badge>
        </div>
      </div>

      {/* Repo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-24">
        {filteredRepos.map((repo, idx) => {
          const isSelected = selected.has(repo.name);
          const isDisabled = !isSelected && selected.size >= FREE_TIER_LIMIT;
          
          return (
            <div 
              key={repo.name}
              onClick={() => !isDisabled && toggleRepo(repo.name)}
              className={`
                group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                ${isSelected 
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_-10px_rgba(37,99,235,0.3)]' 
                  : 'bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60'
                }
                ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}
              `}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isSelected ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 border-white/10 text-muted-foreground group-hover:text-white'}`}>
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors truncate max-w-[160px]" title={repo.name}>
                      {repo.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{repo.language || 'Unknown'}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 scale-110' : 'border-white/20'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                {repo.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> {repo.stars}</span>
                <span className="flex items-center gap-1.5"><GitFork className="w-3.5 h-3.5" /> {repo.forks}</span>
                <span className="ml-auto text-[10px] opacity-70">Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${selected.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 pr-2 shadow-2xl flex items-center gap-6 ring-1 ring-white/10">
          <span className="text-sm font-medium">
            <span className="text-blue-400">{selected.size}</span> repositories selected
          </span>
          <Button 
            onClick={handleAnalyze} 
            size="lg" 
            className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-8 shadow-lg shadow-blue-500/20"
          >
            Analyze Repos <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
