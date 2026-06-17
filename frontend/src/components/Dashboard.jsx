import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  TrendingDown, 
  Leaf, 
  IndianRupee, 
  Award, 
  Sparkles,
  Download,
  AlertCircle,
  X,
  Mic,
  Calendar,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const { user, updateUserMetrics } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickLogText, setQuickLogText] = useState('');
  const [quickLogLoading, setQuickLogLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [insight, setInsight] = useState(null);
  const [showInsight, setShowInsight] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  // Tab state: 'text' | 'voice' | 'manual'
  const [logTab, setLogTab] = useState('text');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Manual bill states
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualCategory, setManualCategory] = useState('Utilities');
  const [manualAmount, setManualAmount] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualUsageDetails, setManualUsageDetails] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  // Fetch initial expense history
  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();

    // Initialize web speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setNotification({ type: 'info', message: 'Listening to your voice...' });
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuickLogText(transcript);
        setIsRecording(false);
        setNotification(null);
      };

      rec.onerror = (event) => {
        console.warn('Speech error', event.error);
        setIsRecording(false);
        setNotification({ type: 'error', message: `Speech recognition error: ${event.error}` });
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      // Simulator fallback if Web Speech isn't supported/available in sandbox
      setIsRecording(true);
      setNotification({ type: 'info', message: 'Simulating speech transcript capture...' });
      
      setTimeout(() => {
        const samples = [
          "Paid standard electricity bill of five hundred rupees at electricity board",
          "Bought vegan burger at Organic Cafe for 250 rupees",
          "Booked metro transit card ticket for 80 rupees",
          "Gas bill paid for six hundred rupees"
        ];
        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        setQuickLogText(randomSample);
        setIsRecording(false);
        setNotification(null);
      }, 2500);
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      setQuickLogText('');
      recognition.start();
    }
  };

  // Handle Drag Over
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process Receipt Upload
  const handleUploadFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setDragActive(false);
    setNotification(null);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch('/api/expenses/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error processing receipt');
      }

      setExpenses(prev => [data.expense, ...prev]);
      updateUserMetrics(data.user);
      triggerSuccessInsights(data.expense);

    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message || 'Parsing failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Process Drop Event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  // Process manual file selector
  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  // Submit text quick log
  const handleQuickLogSubmit = async (e) => {
    e.preventDefault();
    if (!quickLogText.trim()) return;

    setQuickLogLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/expenses/quick-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quickLogText }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error parsing quick text');
      }

      setExpenses(prev => [data.expense, ...prev]);
      updateUserMetrics(data.user);
      triggerSuccessInsights(data.expense);
      setQuickLogText('');
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message || 'Quick log failed.' });
    } finally {
      setQuickLogLoading(false);
    }
  };

  // Submit Manual utility bill logger
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualMerchant || !manualCategory || !manualAmount) return;

    setManualLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/expenses/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: manualMerchant,
          category: manualCategory,
          amount: Number(manualAmount),
          date: manualDate,
          usageDetails: manualUsageDetails
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error parsing manual bill');
      }

      setExpenses(prev => [data.expense, ...prev]);
      updateUserMetrics(data.user);
      triggerSuccessInsights(data.expense);
      
      // Clear fields
      setManualMerchant('');
      setManualAmount('');
      setManualUsageDetails('');
      setNotification({ type: 'success', message: 'Manual bill logged successfully!' });
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: error.message || 'Manual logging failed.' });
    } finally {
      setManualLoading(false);
    }
  };

  // Custom Success Insights & Confetti Trigger
  const triggerSuccessInsights = (expense) => {
    if (expense.carbonScore >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }

    let suggestion = '';
    if (expense.category === 'Dining') {
      suggestion = 'Alternative Identified: Switching your daily coffee item to a reusable container will save you ₹240 and 1.2kg CO₂ next week!';
    } else if (expense.category === 'Transit') {
      suggestion = expense.carbonScore < 50 
        ? 'Carbon Saver Tip: Commuting via Metro/Bus instead of private cabs cuts travel emissions by 80% and saves ₹400/week.'
        : 'Amazing Job! Your public transit selection saved 1.8kg of CO₂ emissions compared to standard fuel cabs.';
    } else if (expense.category === 'Groceries') {
      suggestion = 'Eco Shopping Tip: Substituting 1kg of red meat with plant-based protein saves roughly 27kg of CO₂ emissions.';
    } else {
      suggestion = `Carbon score computed at ${expense.carbonScore}/100. Reduce non-reusable purchases to earn bonus points.`;
    }

    setInsight({
      merchant: expense.merchant,
      carbonScore: expense.carbonScore,
      co2SavedKg: expense.co2SavedKg,
      suggestion
    });
    setShowInsight(true);
  };

  // Download PDF certificate
  const downloadCertificate = async () => {
    try {
      setNotification({ type: 'info', message: 'Generating certificate PDF, please wait...' });
      const response = await fetch('/api/reports/certificate');
      if (!response.ok) throw new Error('Could not download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sustainability_certificate_${user.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setNotification(null);
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: 'Failed to download certificate PDF.' });
    }
  };

  const currentPoints = user?.ecoPoints || 0;
  const isUnlocked = currentPoints >= 50;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Green Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time environmental diagnostics & AI financial ledger.
          </p>
        </div>
        
        {isUnlocked ? (
          <button
            onClick={downloadCertificate}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-200 cursor-pointer text-sm"
          >
            <Download className="w-4.5 h-4.5" />
            <span>Download Eco-Certificate</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-sm select-none">
            <Lock className="w-4.5 h-4.5 text-slate-400" />
            <span>Unlocks at 50 pts (needs {50 - currentPoints} more)</span>
          </div>
        )}
      </div>

      {/* Alert Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          notification.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400' 
            : notification.type === 'info'
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-705 dark:text-blue-400 animate-pulse'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        }`}>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-70 cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DUAL-AXIS METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Expenditure card */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-500 dark:text-slate-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Total Expenditures
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
            ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2.5">
            From {expenses.length} logged invoices
          </p>
        </div>

        {/* Total Carbon Offset card */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm border-emerald-500/20 dark:border-emerald-500/10 relative overflow-hidden">
          <div className="absolute right-4 top-4 bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
            <Leaf className="w-5 h-5" />
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Carbon Offset
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-emerald-400 mt-2">
            {(user?.totalCarbonOffset || 0).toFixed(1)} <span className="text-base font-medium">kg CO₂</span>
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2.5">
            Mitigated cumulative footprint
          </p>
        </div>

        {/* Cumulative EcoPoints card */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Eco Points
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
            {user?.ecoPoints || 0}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-2.5">
            Login Streak: {user?.loginStreak || 1} 🔥
          </p>
        </div>

        {/* Weekly Eco Score card */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 bg-amber-500/10 p-2 rounded-xl text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Weekly Eco Score
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-2">
            {user?.weeklyScore || 100} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">/100</span>
          </h3>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-2.5 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Targeting &lt; 20kg weekly emissions</span>
          </div>
        </div>
      </div>

      {/* FILE DROPZONE & LOGGING PANE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COMPONENT: RECEIPT SCANNER */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="glass-panel rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-8 transition-opacity duration-300">
                <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full shimmer-loader"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 rounded shimmer-loader"></div>
                      <div className="h-3 w-20 rounded shimmer-loader"></div>
                    </div>
                  </div>
                  <div className="h-32 w-full rounded-xl shimmer-loader"></div>
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-semibold animate-pulse pt-2">
                    AI extracting receipt & reconciling CO₂ metrics...
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                <span>AI Receipt Scanner</span>
              </h2>
            </div>

            {/* Drop Zone Box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer min-h-[180px] ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-500/5' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/2'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onFileChange}
              />
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-4 rounded-full mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                Drag and drop your receipt image here
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-center">
                or click to browse local files
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: INTEGRATED TABS LOGGER */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            {/* Tab Header Selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 gap-4">
              <button
                onClick={() => setLogTab('text')}
                className={`pb-1 px-1 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  logTab === 'text' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Text Log
              </button>
              <button
                onClick={() => setLogTab('voice')}
                className={`pb-1 px-1 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  logTab === 'voice' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Voice / Speech Log
              </button>
              <button
                onClick={() => setLogTab('manual')}
                className={`pb-1 px-1 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                  logTab === 'manual' 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
              >
                Manual Bill Form
              </button>
            </div>

            {/* TAB CONTENT: TEXT LOG */}
            {logTab === 'text' && (
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
                  Describe your transaction in plain English. Gemini extracts category, merchant, amount and CO₂ footprints.
                </p>
                <form onSubmit={handleQuickLogSubmit} className="space-y-4">
                  <textarea
                    value={quickLogText}
                    onChange={(e) => setQuickLogText(e.target.value)}
                    placeholder="Examples:&#13;• Bought vegan burger for ₹240 at BioCafe&#13;• Metro card recharge 500 rupees"
                    rows={4}
                    className="w-full p-4 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm leading-normal resize-none"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={quickLogLoading || !quickLogText.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/5 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    {quickLogLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Parse & Log Expense</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: VOICE LOG */}
            {logTab === 'voice' && (
              <div className="text-center space-y-4">
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed text-left">
                  Speak clearly to describe your transaction. We will record your voice, transcribe it, and analyze the carbon impact using Gemini.
                </p>

                <div className="flex flex-col items-center justify-center py-6">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all cursor-pointer transform active:scale-95 ${
                      isRecording 
                        ? 'bg-rose-500 border-rose-300 text-white animate-pulse' 
                        : 'bg-emerald-500 border-emerald-300 text-white'
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-3">
                    {isRecording ? 'Listening (Click to stop)' : 'Click to Speak'}
                  </span>
                </div>

                {quickLogText && (
                  <div className="bg-slate-50 dark:bg-emerald-950/5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-left">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Transcript Capture</p>
                    <p className="text-sm text-slate-800 dark:text-white leading-relaxed">"{quickLogText}"</p>
                  </div>
                )}

                <button
                  onClick={handleQuickLogSubmit}
                  disabled={quickLogLoading || !quickLogText.trim() || isRecording}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-4"
                >
                  {quickLogLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Analyze Voice Expense</span>
                  )}
                </button>
              </div>
            )}

            {/* TAB CONTENT: MANUAL BILL FORM */}
            {logTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Manually register utility bills or invoices that don't have transaction receipts (e.g. Electric Grid bills, water pipeline bills, gas line bills).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Provider / Merchant</label>
                    <input
                      type="text"
                      required
                      value={manualMerchant}
                      onChange={(e) => setManualMerchant(e.target.value)}
                      placeholder="e.g. Tata Power, Aqua Water Co"
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Utilities">Utilities (Electricity/Power)</option>
                      <option value="Water">Water Bill</option>
                      <option value="Gas">Gas Bill</option>
                      <option value="Transit">Transit/Fuel bill</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bill Amount (INR)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="₹"
                      className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Billing Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Usage Description (Optional)</label>
                  <input
                    type="text"
                    value={manualUsageDetails}
                    onChange={(e) => setManualUsageDetails(e.target.value)}
                    placeholder="e.g. 150 kWh consumed, solar panels active, etc."
                    className="w-full px-4 py-2.5 bg-white dark:bg-emerald-950/10 border border-slate-200 dark:border-slate-800/80 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={manualLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  {manualLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Analyze & Audit Bill</span>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex gap-2.5 items-start text-[11px] text-slate-400 dark:text-slate-505">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Audit algorithms underpinned by Google Gemini 1.5 Flash.</span>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTION LEDGER LOG */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm overflow-hidden">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
          Recent Transactions
        </h2>
        
        {expenses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 dark:text-slate-500">No transactions recorded yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Upload a receipt image or submit a Log above to start tracking!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">Merchant</th>
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Carbon Score</th>
                  <th className="pb-3 px-4">Carbon Impact</th>
                  <th className="pb-3 px-4 text-right">CO₂ Mitigated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-50/50 dark:hover:bg-emerald-950/5 transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-slate-800 dark:text-white">
                      {expense.merchant}
                      <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                        {new Date(expense.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{expense.category}</td>
                    <td className="py-3.5 px-4 font-medium">₹{expense.amount}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          expense.carbonScore >= 75 ? 'bg-emerald-500' : expense.carbonScore >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        <span>{expense.carbonScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-xs font-semibold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        expense.carbonImpact === 'low' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : expense.carbonImpact === 'medium' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {expense.carbonImpact}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {expense.co2SavedKg > 0 ? `+${expense.co2SavedKg.toFixed(1)} kg` : '0 kg'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ALTERNATIVE INSIGHT DRAWER */}
      <div 
        className={`fixed bottom-0 right-0 md:right-8 w-full md:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:rounded-t-3xl shadow-2xl z-40 transform transition-transform duration-500 ease-out no-scrollbar ${
          showInsight ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white">
                Eco-Impact Logged
              </h4>
            </div>
            <button 
              onClick={() => setShowInsight(false)} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {insight && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/10">
                <div className="text-center shrink-0">
                  <span className="block text-2xl font-black text-emerald-500 dark:text-emerald-400">
                    {insight.carbonScore}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                    Score
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                    {insight.merchant}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Saved {insight.co2SavedKg.toFixed(1)} kg of CO₂ compared to baseline.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div className="flex gap-2 text-emerald-500 dark:text-mint-400 mb-2">
                  <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Alternative Identified</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {insight.suggestion}
                </p>
              </div>

              <button
                onClick={() => setShowInsight(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
              >
                Acknowledge & Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
