import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeRepos, generatePdf, type AnalysisResult, type UsageInfo } from '@/lib/api';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Download, Lock, ExternalLink, Zap } from 'lucide-react';

const TIER_COLORS = {
  strong: 'text-green-400 bg-green-400/10 border-green-400/20',
  decent: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  weak: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  poor: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const TIER_LABELS = {
  strong: 'Strong',
  decent: 'Decent',
  weak: 'Needs Work',
  poor: 'Poor',
};

export default function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const username = searchParams.get('user') || '';
  const reposParam = searchParams.get('repos') || '';
  const repos = reposParam.split(',').filter(Boolean);

  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!username || repos.length === 0) {
      navigate('/');
      return;
    }

    // Create a unique cache key for this analysis
    const cacheKey = `repoview_${username}_${repos.sort().join(',')}`;
    
    // Check sessionStorage for cached results
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { analyses: cachedAnalyses, usage: cachedUsage, timestamp } = JSON.parse(cached);
        // Use cache if it's less than 1 hour old
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          setAnalyses(cachedAnalyses);
          setUsage(cachedUsage);
          setLoading(false);
          return;
        }
      } catch {
        // Invalid cache, continue to fetch
        sessionStorage.removeItem(cacheKey);
      }
    }

    // No valid cache, fetch from API
    analyzeRepos(username, repos)
      .then((data) => {
        setAnalyses(data.analyses);
        setUsage(data.usage);
        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify({
          analyses: data.analyses,
          usage: data.usage,
          timestamp: Date.now(),
        }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username, repos.join(','), navigate]);

  const handleDownloadPdf = async () => {
    if (!usage?.isPremium) {
      const gumroadUrl = import.meta.env.VITE_GUMROAD_URL || 'https://gumroad.com';
      window.open(`${gumroadUrl}?github_username=${encodeURIComponent(username)}`, '_blank');
      return;
    }

    setDownloading(true);
    try {
      const blob = await generatePdf(username, analyses);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repoview-${username}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 pt-24 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-12 w-64 mb-8" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-96 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl max-w-md text-center border-red-500/20">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate(`/analyze?user=${username}`)} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 pt-12 max-w-6xl mx-auto pb-32">
       {/* Background Glow */}
       <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <button 
             onClick={() => navigate(`/analyze?user=${username}`)}
             className="text-muted-foreground hover:text-white flex items-center gap-2 mb-4 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Repos
          </button>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Analysis Results</h1>
          <p className="text-xl text-muted-foreground">
            Analysis for <span className="text-white font-medium">@{username}</span> • {analyses.length} repositories
          </p>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleDownloadPdf} 
            size="lg"
            disabled={downloading}
            className={`rounded-full shadow-lg transition-all ${!usage?.isPremium ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            {usage?.isPremium ? (
              downloading ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download Report</>
            ) : (
              <><Lock className="w-4 h-4 mr-2" /> Unlock Detailed PDF</>
            )}
          </Button>
        </div>
      </div>

      {/* Usage Banner */}
      {!usage?.isPremium && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-yellow-200 font-medium">Free Tier Limit</p>
              <p className="text-yellow-500/70 text-sm">You've analyzed {usage?.reposAnalyzed} / {usage?.limit} repositories.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10" onClick={handleDownloadPdf}>
            Upgrade to Pro
          </Button>
        </div>
      )}

      {/* Analysis Cards */}
      <div className="space-y-8">
        {analyses.map((analysis, idx) => (
          <div 
            key={analysis.repoName} 
            className="glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
          >
            {/* Card Header */}
            <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{analysis.repoName}</h2>
                    <Badge variant="outline" className={`px-3 py-1 rounded-full text-sm font-medium border ${TIER_COLORS[analysis.tier]}`}>
                      {TIER_LABELS[analysis.tier]}
                    </Badge>
                  </div>
                  <a href={analysis.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 transition-colors w-fit">
                    {analysis.repoUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-4xl font-black text-white tracking-tight">{analysis.percentage}%</div>
                    <div className="text-muted-foreground text-sm font-medium">Total Score</div>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-white/10 relative flex items-center justify-center">
                     <span className={`absolute inset-0 rounded-full border-4 border-t-transparent ${analysis.percentage > 70 ? 'border-green-500' : analysis.percentage > 50 ? 'border-blue-500' : 'border-yellow-500'} rotate-[-45deg]`}></span>
                  </div>
                </div>
              </div>
              <Progress value={analysis.percentage} className="h-1.5 bg-white/5 mt-6" />
            </div>

            {/* Card Content */}
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Feedback Section */}
              <div className="space-y-6">
                {/* Strengths */}
                {analysis.strengths.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Strengths
                    </h3>
                    <ul className="space-y-3">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                           {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {analysis.weaknesses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" /> Improvement Areas
                    </h3>
                    <ul className="space-y-3">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                           <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                           {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Suggestions Section */}
              <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/10 h-fit">
                 <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Actionable Suggestions
                 </h3>
                 {analysis.suggestions.length > 0 ? (
                    <ul className="space-y-4">
                      {analysis.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-3">
                           <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                             {i + 1}
                           </div>
                           <span className="text-sm text-blue-100/80 leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                 ) : (
                   <p className="text-sm text-muted-foreground italic">Great job! No major suggestions found.</p>
                 )}
              </div>
              
            </div>
          </div>
        ))}
      </div>
      
       <div className="mt-16 text-center text-muted-foreground text-sm opacity-50">
        Generated by RepoView API • No AI models were used in this analysis
      </div>
    </div>
  );
}
