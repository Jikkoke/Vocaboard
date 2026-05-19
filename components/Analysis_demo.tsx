import React, { useEffect, useState } from 'react';
import { X, Brain, Zap, Clock, Activity, Music, MessageSquare } from 'lucide-react';
import MetricCard from './MetricCard';

// ダミーデータ（Propsから受け取る場合は適宜置き換えてください）
const defaultData = {
  audio: {
    prediction: '認知症傾向あり',
    confidence: '81.0%',
    metrics: [
      { label: '発話速度 (syll/sec)', value: '2.45', color: 'text-amber-500' },
      { label: '沈黙率 (Pause Ratio)', value: '24.3%', color: 'text-rose-500' },
      { label: 'ジッター (揺らぎ)', value: '1.24%', color: 'text-blue-500' },
      { label: 'シマー (振幅変化)', value: '0.34dB', color: 'text-blue-500' },
    ]
  },
  lang: {
    prediction: 'MCI疑い',
    confidence: '65.4%',
    metrics: [
      { label: '語彙多様性 (TTR)', value: '0.42', color: 'text-rose-500' },
      { label: '抽象語率', value: '12.5%', color: 'text-amber-500' },
      { label: '代名詞比率', value: '34.1%', color: 'text-rose-500' },
      { label: '平均発話長 (MLU)', value: '4.20', color: 'text-blue-500' },
    ]
  }
};

const Analysis_demo = ({ isOpen, onClose, data = defaultData }: { isOpen: boolean, onClose: () => void, data?: typeof defaultData }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 横スクロール用の共通カードクラス (親の幅に合わせる、スクロール時に中央スナップ)
  const cardClass = "w-full shrink-0 snap-center px-1 space-y-6";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">VocaSense 解析レポート</h1>
            <p className="text-xs text-slate-400 mt-1 font-bold tracking-wider uppercase">左右にスクロールして各モダリティの詳細を確認できます</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Container Area */}
        <div className="overflow-y-auto flex-1 p-8 pt-2 space-y-8">
          
          {/* Main Analytics: Probability Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-slate-100 pb-6">
            {/* Probability Area */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">PROBABILITY / 統合推論確率</h3>
              <div className="space-y-5 border-l-2 border-slate-100 pl-6">
                {[
                  { label: '健康', color: 'bg-emerald-500', width: 'w-[8%]', val: '8.0%' },
                  { label: 'MCI', color: 'bg-amber-400', width: 'w-[11%]', val: '11.0%' },
                  { label: '認知症', color: 'bg-rose-500', width: 'w-[81%]', val: '81.0%' }
                ].map((item) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-black text-slate-600">{item.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{animate ? item.val : ''}</span>
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

            {/* Transcription Area */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">TRANSCRIPTION / 発話内容</h3>
              <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100/50 h-full flex items-center justify-center">
                <p className="text-indigo-600 font-bold text-base italic leading-relaxed text-center">
                  「学生時代なんかあれして。あーお酒若い時のんだから、カラオケ歌ったりね、あーわからんこういう時急に言われても」
                </p>
              </div>
            </div>
          </div>

          {/* カルーセルセクション: 横スクロールで音声と言語の特徴量・予測結果を切り替え */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">MODALITY FEATURES / モダリティ別特徴量</h3>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              </div>
            </div>

            {/* 横スクロールラッパー */}
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-slate-200">
              
              {/* Card 1: 音声特徴量 (Audio Modality) */}
              <div className={cardClass}>
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100/70 p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500 text-white rounded-xl"><Music size={18} /></div>
                      <h4 className="font-black text-slate-700 text-sm">音声音響モダリティ (Audio)</h4>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      予測: {data.audio.prediction} ({data.audio.confidence})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {data.audio.metrics.map((m, i) => (
                      <MetricCard key={i} icon={<Zap size={16}/>} label={m.label} value={m.value} color={m.color} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: 言語特徴量 (Language Modality) */}
              <div className={cardClass}>
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100/70 p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500 text-white rounded-xl"><MessageSquare size={18} /></div>
                      <h4 className="font-black text-slate-700 text-sm">自然言語モダリティ (Language)</h4>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                      予測: {data.lang.prediction} ({data.lang.confidence})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {data.lang.metrics.map((m, i) => (
                      <MetricCard key={i} icon={<Brain size={16}/>} label={m.label} value={m.value} color={m.color} />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 pt-4 flex justify-center shrink-0 border-t border-slate-50">
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

export default Analysis_demo;
