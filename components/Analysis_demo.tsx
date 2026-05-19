import React, { useEffect, useState } from 'react';
import { X, Brain, Zap, Music, MessageSquare } from 'lucide-react';
import MetricCard from './MetricCard';

// 確率グラフがモダリティごとで異なる構造にアップデート
const defaultData = {
  audio: {
    prediction: '認知症傾向あり',
    confidence: '99.0%',
    // 音声独自の確率データ
    probabilities: [
      { label: '健康', color: 'bg-emerald-500', width: 'w-[0.5%]', val: '0.5%' },
      { label: 'MCI', color: 'bg-amber-400', width: 'w-[0.5%]', val: '0.5%' },
      { label: '認知症', color: 'bg-rose-500', width: 'w-[99%]', val: '99.0%' }
    ],
    metrics: [
      { label: '沈黙割合', value: '53.6%', color: 'text-amber-500' },
      { label: '話速', value: '5.30/s', color: 'text-rose-500' },
      { label: '基本周波数偏差', value: '398Hz', color: 'text-blue-500' }
    ]
  },
  lang: {
    prediction: 'MCI疑い',
    confidence: '65.4%',
    // 言語独自の確率データ
    probabilities: [
      { label: '健康', color: 'bg-emerald-500', width: 'w-[4.6%]', val: '4.6%' },
      { label: 'MCI', color: 'bg-amber-400', width: 'w-[65.4%]', val: '65.4%' },
      { label: '認知症', color: 'bg-rose-500', width: 'w-[30.0%]', val: '30.0%' }
    ],
    metrics: [
      { label: '抽象表現割合', value: '3.3%', color: 'text-rose-500' },
      { label: 'フィラー割合', value: '6.7%', color: 'text-amber-500' },
      { label: '名詞割合', value: '20.0%', color: 'text-rose-500' },
      { label: '構文の深さ', value: '5', color: 'text-blue-500' },
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

  // カルーセル用共通クラス：1つのカードが完全に全幅（親要素内）を占め、スクロール時に中心にスナップ
  const cardClass = "w-full shrink-0 snap-center px-1";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
      <div className="bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">VocaSense 解析レポート</h1>
            <p className="text-xs text-slate-400 mt-1 font-bold tracking-wider uppercase">左右にスクロールして各モーダルの個別確率グラフと特徴量を比較できます</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Container Area */}
        <div className="overflow-y-auto flex-1 p-8 pt-2 space-y-8">
          
          {/* Transcription Area (最上部で固定表示) */}
          <div className="space-y-3 border-b border-slate-100 pb-6">
            <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">TRANSCRIPTION / 発話内容</h3>
            <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100/50 flex items-center justify-center">
              <p className="text-indigo-600 font-bold text-base italic leading-relaxed text-center">
                「学生時代なんかあれして。あーお酒若い時のんだから、カラオケ歌ったりね、あーわからんこういう時急に言われても」
              </p>
            </div>
          </div>

          {/* カルーセルセクション */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">MODALITY ANALYSIS / 特徴量・確率グラフ一覧</h3>
              <div className="flex gap-1.5 items-center bg-slate-100 p-1 rounded-full">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500 text-white shadow-sm">Audio</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-slate-400">Language</span>
              </div>
            </div>

            {/* 横スクロールラッパー */}
            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-thin scrollbar-thumb-slate-200">
              
              {/* ---------------- Card 1: 音声特徴量 & 確率 ---------------- */}
              <div className={cardClass}>
                <div className="bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/60 p-6 rounded-3xl shadow-sm space-y-6">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-center border-b border-blue-100/50 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500 text-white rounded-xl shadow-sm">
                        <Music size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">音声モダリティ (Audio)</h4>
                        <p className="text-[9px] text-slate-400 font-bold tracking-tight">Acoustic Logic</p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">
                      音声予測: {data.audio.prediction} ({data.audio.confidence})
                    </span>
                  </div>

                  {/* 2カラムレイアウト (確率グラフ & 指標) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 音声独自の確率グラフ */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">PROBABILITY / 音声推論確率</h5>
                      <div className="space-y-3.5 border-l-2 border-blue-100 pl-4">
                        {data.audio.probabilities.map((item) => (
                          <div key={item.label} className="group">
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-black text-slate-600">{item.label}</span>
                              <span className="text-[10px] font-bold text-slate-400">{animate ? item.val : ''}</span>
                            </div>
                            <div className="h-7 bg-slate-50 rounded-lg overflow-hidden w-full border border-slate-100">
                              <div 
                                className={`h-full ${item.color} transition-all duration-[1200ms] ease-out ${animate ? item.width : 'w-0'}`} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 音声詳細指標 */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">DETAILED METRICS / 音響特徴量</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.audio.metrics.map((m, i) => (
                          <MetricCard key={i} icon={<Zap size={14}/>} label={m.label} value={m.value} color={m.color} />
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ---------------- Card 2: 言語特徴量 & 確率 ---------------- */}
              <div className={cardClass}>
                <div className="bg-gradient-to-br from-purple-50/50 to-white border border-purple-100/60 p-6 rounded-3xl shadow-sm space-y-6">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-center border-b border-purple-100/50 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500 text-white rounded-xl shadow-sm">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">言語モダリティ (Language)</h4>
                        <p className="text-[9px] text-slate-400 font-bold tracking-tight">Linguistic Logic</p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full">
                      言語予測: {data.lang.prediction} ({data.lang.confidence})
                    </span>
                  </div>

                  {/* 2カラムレイアウト (確率グラフ & 指標) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 言語独自の確率グラフ */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">PROBABILITY / 言語推論確率</h5>
                      <div className="space-y-3.5 border-l-2 border-purple-100 pl-4">
                        {data.lang.probabilities.map((item) => (
                          <div key={item.label} className="group">
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-xs font-black text-slate-600">{item.label}</span>
                              <span className="text-[10px] font-bold text-slate-400">{animate ? item.val : ''}</span>
                            </div>
                            <div className="h-7 bg-slate-50 rounded-lg overflow-hidden w-full border border-slate-100">
                              <div 
                                className={`h-full ${item.color} transition-all duration-[1200ms] ease-out ${animate ? item.width : 'w-0'}`} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 言語詳細指標 */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">DETAILED METRICS / 言語特徴量</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {data.lang.metrics.map((m, i) => (
                          <MetricCard key={i} icon={<Brain size={14}/>} label={m.label} value={m.value} color={m.color} />
                        ))}
                      </div>
                    </div>
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
