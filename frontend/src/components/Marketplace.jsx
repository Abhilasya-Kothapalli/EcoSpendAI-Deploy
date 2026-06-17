import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Marketplace() {
  const { user, adjustUserPoints } = useAuth();
  const [redeemingId, setRedeemingId] = useState(null);
  const [txMessage, setTxMessage] = useState(null);

  // Store Rewards Mock Data
  const rewards = [
    { id: 'straws', title: 'Reusable Metal Straw Set', points: 150, category: 'Lifestyle', image: '🥤', description: 'Pack of 4 stainless steel straws with cleaning brushes and pouch.' },
    { id: 'mug', title: 'Bamboo Fiber Coffee Mug', points: 300, category: 'Kitchen', image: '☕', description: 'Biodegradable, durable travel mug made from organic bamboo fibers.' },
    { id: 'charger', title: 'Solar Powered Charger', points: 800, category: 'Electronics', image: '🔋', description: '10,000mAh portable power bank recharged by sunlight.' },
    { id: 'tote', title: 'Organic Canvas Tote Bag', points: 100, category: 'Fashion', image: '🛍️', description: 'Heavy duty, reusable cotton shopping bag with shoulder straps.' },
    { id: 'coupon', title: 'EcoMarket 15% Off Coupon', points: 250, category: 'Voucher', image: '🎟️', description: 'Digital discount code applicable on organic grocery orders.' },
  ];

  // Reward purchase handler
  const handleRedeem = async (reward) => {
    if (!user) return;
    if (user.ecoPoints < reward.points) {
      setTxMessage({
        type: 'error',
        text: `Insufficient points! You need ${reward.points - user.ecoPoints} more points to redeem this.`
      });
      setTimeout(() => setTxMessage(null), 4000);
      return;
    }

    setRedeemingId(reward.id);

    // Call server to deduct points and increment savings
    await adjustUserPoints({
      pointsChange: -reward.points,
      savingsChange: Math.round(reward.points * 0.5) // Redeemable rewards represents fiscal value saved
    });

    setRedeemingId(null);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    setTxMessage({
      type: 'success',
      text: `Successfully redeemed: ${reward.title}! Check your email/wallet for details.`
    });

    setTimeout(() => setTxMessage(null), 5000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Eco-Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Redeem sustainable lifestyle awards and check in to community actions.
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/15 rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0">
          <Star className="w-5 h-5 text-emerald-500 animate-spin" />
          <div>
            <span className="text-[10px] block text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Your Balance</span>
            <span className="text-lg font-black text-slate-800 dark:text-emerald-400">{user?.ecoPoints || 0} PTS</span>
          </div>
        </div>
      </div>

      {txMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between border transition-all duration-300 ${
          txMessage.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
        }`}>
          <span className="text-sm font-semibold">{txMessage.text}</span>
          <button onClick={() => setTxMessage(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* MOCK MARKETPLACE STORE */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
          <ShoppingBag className="w-5 h-5 text-emerald-500" />
          <span>Sustainable Rewards Catalog</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const canAfford = user && user.ecoPoints >= reward.points;
            return (
              <div key={reward.id} className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{reward.image}</span>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {reward.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block text-lg font-black text-slate-800 dark:text-white">
                      {reward.points}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">points cost</span>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={redeemingId === reward.id}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      canAfford 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 active:scale-95' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {redeemingId === reward.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Redeem Item</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
