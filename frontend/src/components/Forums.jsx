import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Search, Flame, Rss } from 'lucide-react';

export default function Forums() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubreddit, setSelectedSubreddit] = useState('All');

  // Fetch Reddit Blogs
  useEffect(() => {
    const fetchReddit = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/expenses/reddit');
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to load Reddit blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReddit();
  }, []);

  // Filter options based on available data
  const subreddits = ['All', ...new Set(blogs.map(b => b.subreddit))];

  // Filtering logic
  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubreddit = selectedSubreddit === 'All' || b.subreddit === selectedSubreddit;
    return matchesSearch && matchesSubreddit;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2.5">
          <Rss className="w-8 h-8 text-emerald-500" />
          <span>Eco Forums & News Feed</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Explore trending climate news, carbon offset discussions, and green lifestyle guides aggregated directly from Reddit.
        </p>
      </div>

      {/* Search and Filters Pane */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 p-4 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search discussions or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 dark:text-white placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Subreddit Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {subreddits.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubreddit(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedSubreddit === sub
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List of Articles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-850/40 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-250 dark:bg-slate-800 rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-250 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-12 bg-slate-250 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-4 bg-slate-250 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBlogs.map((b) => (
            <a
              key={b.id}
              href={b.url}
              target="_blank"
              rel="noreferrer"
              className="group glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/40 hover:border-emerald-500/35 hover:bg-emerald-500/2 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Header Tag / Upvote Info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-650 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-md border border-orange-500/10">
                    {b.subreddit}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                    <span>{b.score} upvotes</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-slate-850 dark:text-slate-100 group-hover:text-emerald-500 leading-snug transition-colors line-clamp-3 text-base md:text-lg mb-3">
                  {b.title}
                </h3>
              </div>

              {/* Card Footer Details */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Posted by <span className="font-bold text-slate-500 dark:text-slate-400">u/{b.author}</span>
                </div>

                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  <span>Read Article</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-350 text-base">No discussions found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Try tweaking your search term or selecting another subreddit filter.</p>
        </div>
      )}
    </div>
  );
}
