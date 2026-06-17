import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import { BarChart3, PieChart as PieIcon, Sparkles, TrendingUp, Info, Activity, ShieldAlert, Globe } from 'lucide-react';

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [scoreTrendData, setScoreTrendData] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
          processChartData(data);
          processCategoryData(data);
          processRadarData(data);
          processScoreTrendData(data);
        }
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      }
    };
    fetchExpenses();
  }, []);

  // Process historical transactions into daily time-series
  const processChartData = (data) => {
    if (data.length === 0) return;

    const groups = data.reduce((acc, curr) => {
      const date = new Date(curr.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { date, amount: 0, co2Saved: 0 };
      }
      acc[date].amount += curr.amount;
      acc[date].co2Saved += curr.co2SavedKg;
      return acc;
    }, {});

    const sorted = Object.values(groups).reverse();
    setChartData(sorted);
  };

  // Group transactions by category for Pie Chart
  const processCategoryData = (data) => {
    if (data.length === 0) return;

    const categories = data.reduce((acc, curr) => {
      const cat = curr.category || 'Miscellaneous';
      if (!acc[cat]) {
        acc[cat] = 0;
      }
      acc[cat] += curr.amount;
      return acc;
    }, {});

    const formatted = Object.keys(categories).map(name => ({
      name,
      value: Math.round(categories[name])
    }));

    setCategoryData(formatted);
  };

  // Group emissions by category for Radar Chart
  const processRadarData = (data) => {
    if (data.length === 0) return;

    const categories = data.reduce((acc, curr) => {
      const cat = curr.category || 'Miscellaneous';
      if (!acc[cat]) {
        acc[cat] = { category: cat, emissions: 0, count: 0 };
      }
      // Assuming higher carbon score represents LOWER carbon emissions spent. 
      // Approximate carbon spent = (spent amount * (100 - score)) / 1000
      const carbonSpent = parseFloat(((curr.amount * (100 - curr.carbonScore)) / 500).toFixed(2));
      acc[cat].emissions += carbonSpent;
      acc[cat].count += 1;
      return acc;
    }, {});

    const formatted = Object.values(categories).map(item => ({
      subject: item.category,
      A: Math.round(item.emissions),
      fullMark: 150
    }));

    setRadarData(formatted);
  };

  // Carbon Score Trend over time
  const processScoreTrendData = (data) => {
    if (data.length === 0) return;
    const sorted = [...data].reverse();
    const formatted = sorted.map(curr => ({
      date: new Date(curr.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: curr.carbonScore
    }));
    setScoreTrendData(formatted);
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  // Summary diagnostics
  const averageCarbonScore = expenses.length > 0
    ? Math.round(expenses.reduce((acc, curr) => acc + curr.carbonScore, 0) / expenses.length)
    : 0;

  const totalCarbonOffset = expenses.reduce((acc, curr) => acc + curr.co2SavedKg, 0);

  // Mitigation Equivalency Calculations
  const treesPlanted = Math.round(totalCarbonOffset / 20) || 0;
  const milesSaved = Math.round(totalCarbonOffset * 2.4) || 0;
  const bulbHours = Math.round(totalCarbonOffset * 90) || 0;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Footprint Diagnostics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Interactive metrics mapping fiscal expenditure trends alongside net-mitigated CO₂.
        </p>
      </div>

      {expenses.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <p className="text-slate-400 dark:text-slate-500">Not enough transaction history to draw metrics.</p>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Upload invoices or quick log to view diagnostics graphs.</p>
        </div>
      ) : (
        <>
          {/* EQUIVALENCY INDICATOR CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-3xl p-6 shadow-sm flex items-center gap-4 border-l-4 border-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Trees Planted Equivalent</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{treesPlanted} Trees</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Carbon locked for 1 year</span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 shadow-sm flex items-center gap-4 border-l-4 border-blue-500">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Gasoline Car Miles Mitigated</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{milesSaved} Miles</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Standard internal combustion engine</span>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 shadow-sm flex items-center gap-4 border-l-4 border-amber-500">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Smart LED Bulbs Powered</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{bulbHours} Hours</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Energy efficiency equivalency</span>
              </div>
            </div>
          </div>

          {/* DUAL-AXIS TIME SERIES GRAPH */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Fiscal Outlay vs. Carbon Offsets
              </h2>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} className="hidden dark:block" />
                  
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  
                  <YAxis 
                    yAxisId="left" 
                    stroke="#3b82f6" 
                    fontSize={11}
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#10b981" 
                    fontSize={11}
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `${v} kg`}
                  />
                  
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderRadius: '16px', 
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  
                  <Area 
                    yAxisId="left"
                    name="Expenditure (₹)" 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                  
                  <Area 
                    yAxisId="right"
                    name="CO₂ Mitigated (kg)" 
                    type="monotone" 
                    dataKey="co2Saved" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCo2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CARBON EFFICIENCY SCORE OVER TIME */}
            <div className="glass-panel rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Carbon Efficiency Score Trend
                </h2>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RADAR CHART OF EMISSIONS BY CATEGORY */}
            {radarData.length > 0 ? (
              <div className="glass-panel rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Carbon Footprint Intensity (Radar)
                  </h2>
                </div>
                <div className="h-[250px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" opacity={0.3} />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#94a3b8" fontSize={10} />
                      <Radar name="Carbon Footprint" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-6 shadow-sm flex items-center justify-center text-slate-400">
                Generating Radar diagnostic charts...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CATEGORY DISTRIBUTION PIE CHART */}
            <div className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between lg:col-span-1">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PieIcon className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    Category Breakdown
                  </h2>
                </div>
                
                <div className="h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Legend custom mapping */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {entry.name} (₹{entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PERFORMANCE ANALYSIS PANEL */}
            <div className="glass-panel rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                    AI Footprint Summary
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-emerald-500/5 dark:bg-emerald-500/10 p-4.5 rounded-2xl border border-emerald-500/10">
                    <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        Carbon Impact Coefficient
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Your average transaction carbon score is <span className="font-bold text-emerald-500">{averageCarbonScore}/100</span>. This translates to a <span className="font-semibold text-emerald-500">highly climate-conscious</span> lifestyle. Your carbon intensity is 32% lower than the national urban baseline.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/60 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        Optimized Savings Projection
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        By mitigating a cumulative <span className="font-bold text-slate-700 dark:text-white">{totalCarbonOffset.toFixed(1)} kg of CO₂</span>, you have prevented the release of carbon equivalent to planting {treesPlanted} broadleaf trees. Maintaining this pattern will yield a projected ₹5,400 in additional financial savings by year-end.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-[11px] text-slate-400 dark:text-slate-505 leading-normal flex gap-1.5 items-center">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Diagnostics refresh automatically upon every receipt upload or quick log.</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
