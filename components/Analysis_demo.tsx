import React, { useEffect, useState } from 'react';
import { X, Brain, Zap, Clock, Activity } from 'lucide-react';
import MetricCard from './MetricCard';

const Analysis_demo = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">VocaSense 解析レポート</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Demo Version / 2026-04-21</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pt-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Probability Area */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">PROBABILITY / 推論確率</h3>
              <div className="space-y-5 border-l-2 border-slate-100 pl-6">
                {[
                  { label: '健康', color: 'bg-emerald-500', width: 'w-[95%]' },
                  { label: 'MCI', color: 'bg-amber-400', width: 'w-[4%]' },
                  { label: '認知症', color: 'bg-rose-500', width: 'w-[1%]' }
                ].map((item) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-black text-slate-600">{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{(animate && item.label==='健康') ? '95.2%' : ''}</span>
                    </div>
                    <div className="h-9 bg-slate-50 rounded-lg overflow-hidden w-full">
                      <div 
                        className={`h-full ${item.color} transition-all duration-[1500ms] ease-out ${animate ? item.width : 'w-0'}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">DETAILED METRICS / 詳細指標</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard icon={<Brain size={18}/>} label="語彙多様性" value="1.00" color="text-blue-500" />
                <MetricCard icon={<Zap size={18}/>} label="発話速度" value="10.034" color="text-blue-500" />
                <MetricCard icon={<Clock size={18}/>} label="沈黙率" value="19.3%" color="text-blue-500" />
                <MetricCard icon={<Activity size={18}/>} label="抽象語率" value="0.0%" color="text-blue-500" />
              </div>
            </div>
          </div>

          {/* Transcription Area */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
               TRANSCRIPTION / 発話内容
            </h3>
            <div className="bg-indigo-50/50 p-8 rounded-[24px] border border-indigo-100/50">
              <p className="text-indigo-600 font-bold text-xl italic leading-relaxed text-center">「曲動もいい story」</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex justify-center">
          <button 
            onClick={onClose}
            className="bg-[#0F172A] text-white px-12 py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportModal;
