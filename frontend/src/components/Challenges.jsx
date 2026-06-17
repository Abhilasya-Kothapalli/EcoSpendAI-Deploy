import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Share2, Copy, Check, X, Sparkles, Smile, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CHALLENGES = [
  { id: 'plastic', title: '#NoPlasticWeek', description: 'Avoid single-use plastics for 7 days.', points: 100, icon: '🥤', co2Saving: '10kg' },
  { id: 'transit', title: '#RideTransit', description: 'Commute via bus, train, or bicycle instead of driving.', points: 150, icon: '🚲', co2Saving: '15kg' },
  { id: 'meatless', title: '#MeatlessMonday', description: 'Swap animal protein for plant-based meals today.', points: 50, icon: '🥗', co2Saving: '5kg' },
  { id: 'thermostat', title: '#ThermostatShift', description: 'Adjust AC by 2 degrees to conserve electricity.', points: 80, icon: '🔌', co2Saving: '8kg' },
];

export default function Challenges() {
  const { user, acceptChallenge } = useAuth();
  const [loadingChallengeId, setLoadingChallengeId] = useState(null);
  const [sharingChallenge, setSharingChallenge] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const handleAccept = async (challenge) => {
    if (user?.acceptedChallenges?.includes(challenge.title)) return;
    setLoadingChallengeId(challenge.id);
    try {
      await acceptChallenge(challenge.title, challenge.points);
      
      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#10b981', '#34d399', '#60a5fa', '#fbbf24']
      });

      setSharingChallenge(challenge);
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to accept challenge.' });
      setTimeout(() => setToastMsg(null), 4000);
    } finally {
      setLoadingChallengeId(null);
    }
  };

  const getPoeticPledge = (ch) => {
    switch (ch.id) {
      case 'plastic':
        return "With green steps and mindful choices, I pledge to honor the Earth. I commit to avoiding single-use plastics to reduce waste, nurture life, and create a sustainable tomorrow.";
      case 'transit':
        return "Leaving a lighter footprint, choosing a greener path. My commitment to public and active transit is a promise to the sky, the air, and the generations to come.";
      case 'meatless':
        return "Every meal is a choice, every bite a pledge. By choosing plant-based meals, I stand with nature, conserving resources and breathing life back into our soil.";
      case 'thermostat':
        return "Conserving energy, cooling the earth. A simple thermostat shift is my silent promise to the trees and oceans—to save power today for a better tomorrow.";
      default:
        return `I commit to ${ch.title} to offset carbon emissions and contribute to a healthier planet. Every small green step leads us to a brighter, sustainable future.`;
    }
  };

  const shareStatement = (challenge) => {
    const pledge = getPoeticPledge(challenge);
    return `🌱 EARTH CHAMPION PLEDGE 🌱\n\n"${pledge}"\n\n- Accepted challenge: ${challenge.title} (${challenge.icon})\n- Offsets: ${challenge.co2Saving} CO₂\n\nJoin me in protecting the planet with EcoSpend AI! 🌍💚✨`;
  };

  const handleDownloadBadge = (challenge) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 800);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.5, '#022c22');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 800);

    // Frame Borders
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, 760, 760);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, 736, 736);

    // Star decorations
    ctx.fillStyle = '#fbbf24';
    ctx.font = '24px Arial';
    ctx.fillText('✨', 50, 75);
    ctx.fillText('✨', 715, 75);
    ctx.fillText('✨', 50, 740);
    ctx.fillText('✨', 715, 740);

    // Header badge banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10b981';
    ctx.font = '900 18px "Courier New", monospace';
    ctx.fillText('ECOSPEND AI • CHALLENGE PLEDGE', 400, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.fillText('EARTH CHAMPION BADGE', 400, 140);

    // User Photo metrics
    const photoRadius = 75;
    const photoX = 400;
    const photoY = 270;

    const drawTextContent = () => {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px "Segoe UI", sans-serif';
      ctx.fillText(user?.name || 'Sustainable Warrior', 400, 395);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '600 14px "Segoe UI", sans-serif';
      ctx.fillText('Eco-Champion & Sustainability Advocate', 400, 420);

      ctx.beginPath();
      ctx.moveTo(250, 440);
      ctx.lineTo(550, 440);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Challenge info card container
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(150, 460, 500, 100);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeRect(150, 460, 500, 100);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillText(challenge.icon + '  ' + challenge.title, 180, 505);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.fillText(`Target: Offsetting ${challenge.co2Saving} CO₂ emissions`, 180, 535);

      // Poetic commitment text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'italic 18px Georgia, serif';
      const pledge = getPoeticPledge(challenge);
      wrapText(ctx, `"${pledge}"`, 400, 605, 520, 28);

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '700 14px "Courier New", monospace';
      ctx.fillText('VERIFIED PLEDGE VIA ECOSPEND AI • JOIN THE MOVEMENT 🌍', 400, 725);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `eco_pledge_${challenge.title.replace('#', '')}.png`;
      link.href = dataUrl;
      link.click();

      setToastMsg({ type: 'success', text: 'Downloaded your Earth Champion Badge successfully!' });
      setTimeout(() => setToastMsg(null), 3500);
    };

    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, currentY);
    };

    // Draw user circular profile photo
    ctx.beginPath();
    ctx.arc(photoX, photoY, photoRadius + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2);
    ctx.save();
    ctx.clip();

    if (user?.profilePhoto) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
        ctx.restore();
        drawTextContent();
      };
      img.onerror = () => {
        ctx.fillStyle = '#065f46';
        ctx.fillRect(photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(user.name.charAt(0).toUpperCase(), photoX, photoY);
        ctx.restore();
        drawTextContent();
      };
      img.src = user.profilePhoto;
    } else {
      ctx.fillStyle = '#065f46';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(user?.name ? user.name.charAt(0).toUpperCase() : 'E', photoX, photoY);
      ctx.restore();
      drawTextContent();
    }
  };

  const handleCopyLink = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const triggerMockShare = (platform, statement) => {
    const encodedText = encodeURIComponent(statement);
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}&u=https://ecospend.ai`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://ecospend.ai`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setToastMsg({ type: 'success', text: `Shared successfully to ${platform.toUpperCase()}!` });
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* View Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2.5">
          <Award className="w-8 h-8 text-emerald-500 animate-pulse" />
          <span>Eco Challenges</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Commit to carbon-mitigating challenges, earn Eco Points, and share your pledges with the world.
        </p>
      </div>

      {toastMsg && (
        <div className={`p-4 rounded-xl flex items-center justify-between border transition-all duration-300 ${
          toastMsg.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        }`}>
          <span className="text-sm font-semibold">{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-xs hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Grid of Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHALLENGES.map((challenge) => {
          const isAccepted = user?.acceptedChallenges?.includes(challenge.title);
          const isLoading = loadingChallengeId === challenge.id;
          
          return (
            <div 
              key={challenge.id} 
              className={`glass-panel rounded-3xl p-6 shadow-sm border flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                isAccepted 
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10' 
                  : 'hover:border-emerald-500/20 hover:-translate-y-0.5'
              }`}
            >
              {isAccepted && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-bl-2xl">
                  Committed
                </div>
              )}
              
              <div>
                <span className="text-5xl block mb-4 filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300 w-fit">
                  {challenge.icon}
                </span>
                
                <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">
                  {challenge.title}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {challenge.description}
                </p>

                <div className="flex gap-3 mt-4">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                    🌱 +{challenge.points} EcoPoints
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    📉 Offsets {challenge.co2Saving} CO₂
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  Target: 7-Day Cycle
                </span>

                {isAccepted ? (
                  <button
                    onClick={() => setSharingChallenge(challenge)}
                    className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Card</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAccept(challenge)}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-350 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Accept Challenge</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SHARING MODAL OVERLAY */}
      {sharingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-between max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>Share Your Commitment!</span>
              </h3>
              <button 
                onClick={() => setSharingChallenge(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sharing Content Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* SHARING POSTER CARD */}
              <div className="relative border border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-emerald-100/10 dark:from-emerald-950/20 dark:to-slate-900 rounded-3xl p-6 shadow-lg shadow-emerald-500/5 text-center flex flex-col items-center select-none overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
                
                {/* Header text on poster */}
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full mb-4.5">
                  EcoSpend AI Challenge Commit
                </span>

                {/* User Image Frame */}
                <div className="relative mb-3.5">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center bg-white dark:bg-slate-800 mx-auto shadow-sm">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-2xl">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
                  {user?.name}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-0.5">Sustainability Advocate</p>

                {/* Challenge Badge Card inside poster */}
                <div className="my-5 p-4 bg-white/70 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-2xl w-full flex items-center gap-3 text-left">
                  <span className="text-4.5xl shrink-0">{sharingChallenge.icon}</span>
                  <div>
                    <h5 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight leading-snug">
                      {sharingChallenge.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      Target: Saving {sharingChallenge.co2Saving} CO₂
                    </p>
                  </div>
                </div>

                {/* Poetic green description */}
                <p className="text-slate-700 dark:text-slate-250 text-xs md:text-sm font-medium italic leading-relaxed px-4 py-3 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-2xl border border-dashed border-emerald-500/20">
                  "{getPoeticPledge(sharingChallenge)}"
                </p>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  <Smile className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                  <span>Verified via EcoSpend AI</span>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                  Share To Platforms
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => triggerMockShare('whatsapp', shareStatement(sharingChallenge))}
                    className="flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => triggerMockShare('linkedin', shareStatement(sharingChallenge))}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
                  >
                    LinkedIn
                  </button>
                  <button 
                    onClick={() => triggerMockShare('facebook', shareStatement(sharingChallenge))}
                    className="flex items-center justify-center gap-2 p-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
                  >
                    Facebook
                  </button>
                  <button 
                    onClick={() => triggerMockShare('twitter', shareStatement(sharingChallenge))}
                    className="flex items-center justify-center gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
                  >
                    Twitter
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-150 dark:border-slate-850 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyLink(shareStatement(sharingChallenge))}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadBadge(sharingChallenge)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-250 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-350 font-bold rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Badge</span>
                </button>
              </div>
              
              <button
                onClick={() => setSharingChallenge(null)}
                className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
