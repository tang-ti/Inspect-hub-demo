import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Terminal,
  Play,
  Star,
  Clock,
  ExternalLink,
  Database,
  Users,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';

const API_BASE = '';

// Map group names to colors
const GROUP_COLORS = {
  Coding: 'bg-blue-900/20 text-blue-400 border-blue-800/50',
  Mathematics: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50',
  Reasoning: 'bg-purple-900/20 text-purple-400 border-purple-800/50',
  Knowledge: 'bg-amber-900/20 text-amber-400 border-amber-800/50',
  Safeguards: 'bg-red-900/20 text-red-400 border-red-800/50',
  Cybersecurity: 'bg-rose-900/20 text-rose-400 border-rose-800/50',
  Scheming: 'bg-orange-900/20 text-orange-400 border-orange-800/50',
  Assistants: 'bg-cyan-900/20 text-cyan-400 border-cyan-800/50',
  Multimodal: 'bg-pink-900/20 text-pink-400 border-pink-800/50',
  Bias: 'bg-yellow-900/20 text-yellow-400 border-yellow-800/50',
  Personality: 'bg-indigo-900/20 text-indigo-400 border-indigo-800/50',
  Writing: 'bg-teal-900/20 text-teal-400 border-teal-800/50',
};

const TagPill = ({ label, className = '' }) => (
  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${className || 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50'}`}>
    {label}
  </span>
);

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const BenchmarkCard = ({ item, onSelect }) => {
  const totalSamples = item.tasks.reduce((sum, t) => sum + t.datasetSamples, 0);
  const groupColor = GROUP_COLORS[item.group] || 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';

  return (
    <div onClick={() => onSelect(item.id)} className="cursor-pointer group relative bg-[#0e0e0e] border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 flex flex-col h-[240px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <TagPill label={item.group} className={groupColor} />
          {item.contributors[0] && (
            <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
              <Users size={10} /> {item.contributors[0]}
            </span>
          )}
        </div>
        {item.arxiv && (
          <a
            href={item.arxiv}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-blue-400 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Title & Description */}
      <div className="flex-1 min-h-0">
        <h3 className="text-zinc-100 font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors truncate">
          {item.id}
        </h3>
        <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 my-3">
        {item.tasks.length > 0 && (
          <TagPill label={`${item.tasks.length} task${item.tasks.length > 1 ? 's' : ''}`} />
        )}
        {totalSamples > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
            <Database size={9} /> {totalSamples.toLocaleString()}
          </span>
        )}
        {item.tags.slice(0, 2).map((tag) => (
          <TagPill key={tag} label={tag} />
        ))}
        {item.dependency && <TagPill label="sandbox" className="bg-orange-900/20 text-orange-400 border-orange-800/50" />}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-zinc-800/50 flex justify-between items-center text-[10px] text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock size={10} /> {timeAgo(item.lastUpdated)}
          </span>
          {item.tasks[0]?.humanBaseline && (
            <span className="flex items-center gap-1 text-emerald-500">
              <Star size={10} /> {(item.tasks[0].humanBaseline.score * 100).toFixed(0)}% human
            </span>
          )}
        </div>
        <button onClick={() => onSelect(item.id)} className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1">
          <Play size={10} fill="currentColor" /> Run
        </button>
      </div>
    </div>
  );
};

const BenchmarkListRow = ({ item, onSelect }) => {
  const totalSamples = item.tasks.reduce((sum, t) => sum + t.datasetSamples, 0);
  const groupColor = GROUP_COLORS[item.group] || 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';

  return (
    <div onClick={() => onSelect(item.id)} className="cursor-pointer group flex items-center gap-4 bg-[#0e0e0e] border border-zinc-800 hover:border-zinc-600 rounded-lg px-4 py-3 transition-all hover:bg-zinc-900/50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-zinc-100 font-semibold text-sm group-hover:text-blue-400 transition-colors truncate">
            {item.id}
          </h3>
          <TagPill label={item.group} className={groupColor} />
        </div>
        <p className="text-zinc-500 text-xs truncate">{item.description}</p>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-zinc-500 shrink-0">
        <span>{item.tasks.length} tasks</span>
        <span className="flex items-center gap-1"><Database size={10} /> {totalSamples.toLocaleString()}</span>
        <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(item.lastUpdated)}</span>
        <button onClick={() => onSelect(item.id)} className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1">
          <Play size={10} fill="currentColor" /> Run
        </button>
      </div>
    </div>
  );
};

const BenchmarkDetail = ({ evalId, evals, onBack }) => {
  const [copied, setCopied] = useState(null);
  const detail = evals.find((e) => e.id === evalId) || null;

  const copyCmd = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied(null), 2000);
  };

  // Extract bash code blocks from README
  const codeBlocks = useMemo(() => {
    if (!detail?.readme) return [];
    const blocks = [];
    const regex = /```bash\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(detail.readme)) !== null) {
      blocks.push(match[1].trim());
    }
    return blocks;
  }, [detail]);

  // Extract the primary run command (the inspect eval line)
  const runCommand = useMemo(() => {
    return codeBlocks.find((b) => b.includes('inspect eval')) || null;
  }, [codeBlocks]);

  // Extract python usage block
  const pythonBlock = useMemo(() => {
    if (!detail?.readme) return null;
    const match = detail.readme.match(/```python\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  }, [detail]);

  if (!detail) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Eval not found</p>
        <button onClick={onBack} className="mt-4 text-blue-400 hover:underline text-sm">Go back</button>
      </div>
    );
  }

  const groupColor = GROUP_COLORS[detail.group] || 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';
  const totalSamples = detail.tasks.reduce((sum, t) => sum + t.datasetSamples, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to benchmarks
      </button>

      {/* Header */}
      <div className="bg-[#0e0e0e] border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <TagPill label={detail.group} className={groupColor} />
          {detail.tags.map((tag) => <TagPill key={tag} label={tag} />)}
          {detail.dependency && <TagPill label="sandbox" className="bg-orange-900/20 text-orange-400 border-orange-800/50" />}
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">{detail.title}</h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{detail.description}</p>
        <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
          {detail.contributors.length > 0 && (
            <span className="flex items-center gap-1"><Users size={12} /> {detail.contributors.join(', ')}</span>
          )}
          <span className="flex items-center gap-1"><Database size={12} /> {totalSamples.toLocaleString()} samples</span>
          <span>{detail.tasks.length} task{detail.tasks.length !== 1 ? 's' : ''}</span>
          {detail.arxiv && (
            <a href={detail.arxiv} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
              <ExternalLink size={12} /> Paper
            </a>
          )}
        </div>
      </div>

      {/* Run Command */}
      {runCommand && (
        <div className="bg-[#0e0e0e] border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
            <Play size={14} className="text-blue-400" /> Run Command
          </h2>
          <div className="relative group">
            <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-sm text-emerald-400 font-mono overflow-x-auto">
              {runCommand}
            </pre>
            <button
              onClick={() => copyCmd(runCommand)}
              className="absolute top-3 right-3 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-all"
            >
              {copied === runCommand ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Python Usage */}
      {pythonBlock && (
        <div className="bg-[#0e0e0e] border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
            <Terminal size={14} className="text-purple-400" /> Python Usage
          </h2>
          <div className="relative group">
            <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-sm text-purple-400 font-mono overflow-x-auto">
              {pythonBlock}
            </pre>
            <button
              onClick={() => copyCmd(pythonBlock)}
              className="absolute top-3 right-3 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-all"
            >
              {copied === pythonBlock ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Tasks */}
      {detail.tasks.length > 0 && (
        <div className="bg-[#0e0e0e] border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">Tasks</h2>
          <div className="space-y-2">
            {detail.tasks.map((task) => (
              <div key={task.name} className="flex items-center justify-between bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-sm">
                <span className="text-zinc-300 font-mono">{task.name}</span>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{task.datasetSamples.toLocaleString()} samples</span>
                  {task.humanBaseline && (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Star size={10} /> {(task.humanBaseline.score * 100).toFixed(0)}% human
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BenchmarkHub = () => {
  const [activeTab, setActiveTab] = useState('Explore');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEval, setSelectedEval] = useState(null);

  useEffect(() => {
    // Try static JSON first (GitHub Pages), fall back to API (local dev)
    fetch(`${import.meta.env.BASE_URL}evals.json`)
      .then((res) => {
        if (!res.ok) throw new Error('No static data');
        return res.json();
      })
      .catch(() => fetch(`${API_BASE}/api/evals`).then((res) => res.json()))
      .then((data) => {
        setEvals(data.evals);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const groups = useMemo(() => {
    const g = [...new Set(evals.map((e) => e.group))].sort();
    return ['All', ...g];
  }, [evals]);

  const filtered = useMemo(() => {
    let result = evals;
    if (selectedGroup !== 'All') {
      result = result.filter((e) => e.group === selectedGroup);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.contributors.some((c) => c.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.tasks.some((t) => t.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [evals, selectedGroup, searchQuery]);

  // Group filtered evals by their group
  const grouped = useMemo(() => {
    const map = {};
    for (const e of filtered) {
      if (!map[e.group]) map[e.group] = [];
      map[e.group].push(e);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-blue-900 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-lg">
              <Terminal size={20} className="text-blue-500" />
              <span>
                Inspect<span className="text-zinc-500 font-light">Hub</span>
              </span>
            </div>
            <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
              {['Explore', 'My Benchmarks', 'Runs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 font-mono">
              {evals.length} evals loaded
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {selectedEval ? (
          <BenchmarkDetail evalId={selectedEval} evals={evals} onBack={() => setSelectedEval(null)} />
        ) : (
        <>
        <div className="flex flex-col md:flex-row gap-6 justify-between items-end mb-8">
          <div className="w-full md:w-auto flex-1 max-w-2xl">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search benchmarks, authors, or tags..."
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-blue-900/50 focus:ring-1 focus:ring-blue-900 text-sm text-zinc-200 rounded-xl pl-10 pr-4 py-3 placeholder:text-zinc-600 transition-all outline-none"
              />
            </div>
            {/* Group Pills */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {groups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-xs transition-colors ${
                    selectedGroup === group
                      ? 'bg-zinc-100 text-black border-zinc-100'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <Loader2 size={24} className="animate-spin mr-3" />
            Scanning local evals...
          </div>
        )}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-2">Failed to load evals</p>
            <p className="text-zinc-500 text-sm">{error}</p>
            <p className="text-zinc-600 text-xs mt-2">
              Make sure the API server is running: <code className="text-zinc-400">cd server && npm start</code>
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="space-y-10">
            {filtered.length === 0 && (
              <p className="text-center text-zinc-500 py-20">
                No benchmarks match your search.
              </p>
            )}
            {grouped.map(([group, items]) => (
              <section key={group}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-medium text-zinc-100">{group}</h2>
                  <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded text-[10px] font-mono">
                    {items.length}
                  </span>
                </div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                      <BenchmarkCard key={item.id} item={item} onSelect={setSelectedEval} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <BenchmarkListRow key={item.id} item={item} onSelect={setSelectedEval} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default BenchmarkHub;
