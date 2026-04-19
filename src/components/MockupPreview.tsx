import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Smartphone, Zap, MapPin, QrCode, MessageCircle, Star, ShoppingBag, Eye, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function MockupPreview() {
  const { selectedNodeId, nodes } = useStore();
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const modules = selectedNode?.data.mockupModules || [];

  if (!selectedNodeId) return null;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className={cn(
        "transition-all duration-500 ease-in-out border-[8px] border-slate-700 rounded-[2rem] shadow-2xl relative bg-black overflow-hidden w-[260px] h-[450px]"
      )}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-700 rounded-b-xl z-20" />
        
        {/* Browser Bar (WYSIWYG indicator) */}
        {selectedNode.type === 'landing' && (
          <div className="bg-slate-900 border-b border-white/5 pt-4 px-4 pb-2 flex items-center justify-between">
            <div className="flex bg-black/40 px-2 py-1 rounded text-[8px] text-text-dim items-center gap-1.5 flex-1 max-w-[160px]">
              <Smartphone size={8} />
              <span className="truncate">{selectedNode.data.pageType || 'Web Portal'}</span>
            </div>
          </div>
        )}
        
        <div className="h-full overflow-y-auto bg-slate-950 scroll-smooth pb-10 scrollbar-hide">
          {modules.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-bg">
              <ShoppingBag className="text-border mb-4" size={32} />
              <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Preview Ready</p>
            </div>
          ) : (
            <div className="space-y-0">
              <AnimatePresence>
                {modules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full"
                  >
                    <ModuleRenderer module={module} nodeLabel={selectedNode?.data?.label || 'Node'} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleRenderer({ module, nodeLabel }: { module: any; nodeLabel: string }) {
  switch (module.type) {
    case 'Hero':
      return (
        <section className="bg-gradient-to-br from-owned to-indigo-600 p-6 pt-10 text-center text-white relative overflow-hidden">
          <h1 className="text-xl font-black mb-2 leading-tight uppercase tracking-tighter italic">Summer Pass</h1>
          <p className="text-white/60 text-[9px] mb-4">Exclusive O2O Activation for {nodeLabel}</p>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full inline-block text-[10px] font-black uppercase">
            Claim Offer
          </div>
        </section>
      );
    case 'Map':
      return (
        <section className="p-4 bg-sidebar">
          <div className="aspect-[4/3] bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden border border-border mb-2">
            <img src="https://picsum.photos/seed/hkmaps/400/300" className="w-full h-full object-cover opacity-40 grayscale" alt="Map" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin size={16} className="text-red-500 animate-bounce" />
            </div>
          </div>
          <p className="text-[9px] text-text-dim bg-black/40 p-2 rounded border border-border font-medium">
             📍 Central Exit B (2 mins walk)
          </p>
        </section>
      );
    case 'Chatbot':
      return (
        <section className="p-4 bg-bg space-y-3">
          <div className="flex items-start gap-2 max-w-[80%]">
             <div className="bg-sidebar p-2 rounded-xl rounded-tl-none border border-border shadow-sm">
                <p className="text-[10px] text-white">Hi! Scanning for rewards at {nodeLabel}...</p>
             </div>
          </div>
          <div className="flex items-start gap-2 flex-row-reverse max-w-[80%] ml-auto">
             <div className="bg-accent p-2 rounded-xl rounded-tr-none text-bg font-bold">
                <p className="text-[10px]">Redeem Coupon</p>
             </div>
          </div>
        </section>
      );
    case 'CTA':
      return (
        <section className="p-4 flex justify-center">
          <button className="w-full bg-accent text-bg font-black py-3 rounded-xl uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform">
            Get Started Now
          </button>
        </section>
      );
    case 'Form':
      return (
        <section className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-text-dim uppercase">Full Name</label>
            <div className="bg-slate-900 h-8 rounded border border-border" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-text-dim uppercase">Phone Number</label>
            <div className="bg-slate-900 h-8 rounded border border-border" />
          </div>
          <button className="w-full bg-slate-800 text-white font-black py-2 rounded uppercase text-[10px]">
            Submit
          </button>
        </section>
      );
    case 'Subscription':
      return (
        <section className="p-6 bg-owned/10 border-y border-owned/20 text-center">
          <Star className="mx-auto mb-2 text-owned" size={20} />
          <h3 className="text-xs font-black text-white uppercase italic tracking-tighter mb-2">Join Member Club</h3>
          <div className="flex gap-1">
            <div className="bg-slate-900 h-8 rounded border border-border flex-1" />
            <div className="bg-owned px-3 py-1 rounded text-[9px] font-black pointer-events-none flex items-center">OK</div>
          </div>
        </section>
      );
    case 'Redemption':
      return (
        <section className="p-6 text-center">
          <div className="bg-gradient-to-br from-physical to-red-600 p-4 rounded-3xl text-white shadow-xl">
             <Star className="mx-auto mb-1 text-white/50" size={16} />
             <h4 className="text-sm font-black mb-4 uppercase tracking-tighter italic italic">Exclusive Reward</h4>
             <div className="bg-black/20 py-3 rounded-lg border border-white/10 mb-2">
                <p className="text-lg font-mono font-black tracking-widest leading-none underline decoration-accent decoration-2 underline-offset-4">O2O-PASS</p>
             </div>
          </div>
        </section>
      );
    case 'QR':
      return (
        <section className="p-6 text-center bg-white m-4 rounded-2xl">
          <div className="inline-block p-1 border-2 border-bg">
            <QrCode size={120} className="text-bg" />
          </div>
          <p className="text-bg text-[10px] font-black mt-2 uppercase">Scan to Activate</p>
        </section>
      );
    default:
      return (
        <section className="p-4 text-center opacity-20">
          <div className="border border-dashed border-border py-4 rounded italic text-[9px]">Custom Component</div>
        </section>
      );
  }
}


