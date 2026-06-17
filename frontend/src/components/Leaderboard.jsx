import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Award, Sparkles, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setBoard(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]); // Re-fetch when user points change

  // Sort and extract top 3 and others
  const topThree = board.slice(0, 3);
  const remaining = board.slice(3);

  // Helper to reorder podium: [2nd, 1st, 3rd] for visual layout
  const getPodiumOrder = (top3) => {
    if (top3.length < 3) return top3;
    return [top3[1], top3[0], top3[2]]; // Second place, First place, Third place
  };

  const podiumSorted = getPodiumOrder(topThree);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Community Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Compete with fellow green spenders. Rankings calculate based on weekly sustainability index.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* PODIUM SECTION */}
          {topThree.length >= 3 && (
            <div className="grid grid-cols-3 items-end gap-3 md:gap-6 max-w-2xl mx-auto pt-6 px-2">
              
              {/* SECOND PLACE (Left) */}
              <div className="flex flex-col items-center">
                {/* Profile bubble */}
                <div className="relative mb-2">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 flex items-center justify-center overflow-hidden font-bold text-slate-700 dark:text-slate-300 text-lg md:text-xl shadow-md">
                    {podiumSorted[0].profilePhoto ? (
                      <img src={podiumSorted[0].profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      podiumSorted[0].name.charAt(0)
                    )}
                  </div>
                  <span className="absolute -top-1 -right-1 bg-slate-300 text-slate-800 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">2</span>
                </div>
                {/* Podium pillar */}
                <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/20 border border-slate-300/30 rounded-t-2xl p-4 text-center h-28 md:h-36 flex flex-col justify-between shadow-sm">
                  <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-white truncate w-full">{podiumSorted[0].name}</p>
                  <div>
                    <span className="block text-xl md:text-2xl font-black text-slate-600 dark:text-slate-300">{podiumSorted[0].weeklyScore}</span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">weekly</span>
                  </div>
                </div>
              </div>

              {/* FIRST PLACE (Middle) */}
              <div className="flex flex-col items-center">
                {/* Profile bubble */}
                <div className="relative mb-2">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border-4 border-amber-400 flex items-center justify-center overflow-hidden font-extrabold text-emerald-600 dark:text-emerald-400 text-xl md:text-2xl shadow-xl animate-pulse">
                    {podiumSorted[1].profilePhoto ? (
                      <img src={podiumSorted[1].profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      podiumSorted[1].name.charAt(0)
                    )}
                  </div>
                  <Trophy className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-400 drop-shadow" />
                </div>
                {/* Podium pillar */}
                <div className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/5 dark:from-amber-400/25 dark:to-amber-400/5 border-2 border-amber-400/30 rounded-t-3xl p-4 text-center h-36 md:h-48 flex flex-col justify-between shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-amber-400"></div>
                  <p className="text-xs md:text-sm font-extrabold text-amber-600 dark:text-amber-300 truncate w-full">{podiumSorted[1].name}</p>
                  <div>
                    <span className="block text-2xl md:text-3xl font-black text-amber-500">{podiumSorted[1].weeklyScore}</span>
                    <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold">score</span>
                  </div>
                </div>
              </div>

              {/* THIRD PLACE (Right) */}
              <div className="flex flex-col items-center">
                {/* Profile bubble */}
                <div className="relative mb-2">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-amber-600 flex items-center justify-center overflow-hidden font-bold text-slate-700 dark:text-slate-300 text-lg md:text-xl shadow-md">
                    {podiumSorted[2].profilePhoto ? (
                      <img src={podiumSorted[2].profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      podiumSorted[2].name.charAt(0)
                    )}
                  </div>
                  <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">3</span>
                </div>
                {/* Podium pillar */}
                <div className="w-full bg-gradient-to-t from-orange-200/50 to-orange-100/10 dark:from-amber-700/15 dark:to-amber-700/5 border border-amber-700/20 rounded-t-2xl p-4 text-center h-24 md:h-28 flex flex-col justify-between shadow-sm">
                  <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-white truncate w-full">{podiumSorted[2].name}</p>
                  <div>
                    <span className="block text-lg md:text-xl font-black text-amber-700 dark:text-amber-500">{podiumSorted[2].weeklyScore}</span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">weekly</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* LIST VIEW FOR REST OF LEADERBOARD */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm max-w-2xl mx-auto overflow-hidden">
            <h3 className="text-md font-bold text-slate-700 dark:text-white uppercase tracking-wider mb-4">
              Leaderboard Standings
            </h3>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {board.map((player, index) => {
                const isCurrentUser = user && player._name === user.name || player.name === user?.name;
                return (
                  <div 
                    key={player._id} 
                    className={`flex items-center justify-between py-4 ${
                      isCurrentUser ? 'bg-emerald-500/5 -mx-6 px-6 border-l-4 border-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank badge */}
                      <span className="text-sm font-bold text-slate-400 w-5">
                        {index + 1}
                      </span>
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden font-bold text-sm ${
                        isCurrentUser 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {player.profilePhoto ? (
                          <img src={player.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          player.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isCurrentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                          {player.name} {isCurrentUser && <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-1.5 uppercase">You</span>}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          🌱 {player.totalCarbonOffset?.toFixed(1) || 0} kg CO₂ offset
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="block text-base font-extrabold text-slate-800 dark:text-white">
                        {player.weeklyScore}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                        Eco Score
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
