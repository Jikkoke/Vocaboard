"use client";

import React, { useState } from 'react'; // useState を追加
import { X, Brain, Activity, Clock, Zap, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface AnalysisReportModalProps {
  data: any;
  onClose: () => void;
}

export default function AnalysisReportModal({ data, onClose }: AnalysisReportModalProps) {
  if (!data) return null;

  // 1. スクロール領域を制御するためのクラス
  const cardClass = "w-full shrink-0 snap-center px-2 space-y-8";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* ヘッダー：音声/言語のタブ切り替え風インジケーターを追加 */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">解析レポート</h2>
            <div className="flex gap-4 mt-2">
              <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded">音声: {data.audio.prediction}</span>
              <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-600 rounded">言語: {data.lang.prediction}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-all text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* コンテンツ：横スクロールコンテナ */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            
            {/* --- 1枚目：音声解析カード --- */}
            <div className={cardClass}>
              <div className="p-6 md:p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">● Audio Analysis / 音声指標</h3>
                  <p className="text-sm text-gray-400">左右にスワイプ →</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <ProbabilityChart data={data.audio.probabilities} />
                   <div className="grid grid-cols-2 gap-4">
                     <MetricCard icon={<Zap size={20}/>} label="発話速度" value={`${data.audio.features.speed.toFixed(2)}/s`} />
                     <MetricCard icon={<Clock size={20}/>} label="沈黙率" value={`${(data.audio.features.silence * 100).toFixed(1)}%`} />
                     <MetricCard icon={<Activity size={20}/>} label="ピッチ変動" value={data.audio.features.f0_std.toFixed(1)} />
                   </div>
                </div>
              </div>
            </div>

            {/* --- 2枚目：言語解析カード --- */}
            <div className={cardClass}>
              <div className="p-6 md:p-10 space-y-10 border-l border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest">● Linguistic Analysis / 言語指標</h3>
                  <p className="text-sm text-gray-400">← スワイプで戻る</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <ProbabilityChart data={data.lang.probabilities} />
                   <div className="grid grid-cols-2 gap-4">
                     <MetricCard icon={<Brain size={20}/>} label="フィラー率" value={`${(data.lang.features.filler * 100).toFixed(1)}%`} />
                     <MetricCard icon={<Activity size={20}/>} label="抽象語率" value={`${(data.lang.features.abstract * 100).toFixed(1)}%`} />
                     <MetricCard icon={<MessageSquare size={20}/>} label="構文の深さ" value={data.lang.features.depth} />
                     <MetricCard icon={<MessageSquare size={20}/>} label="名詞割合" value={`${(data.lang.features.noun * 100).toFixed(1)}%`} />
                   </div>
                </div>
              </div>
            </div>

          </div>

          {/* 書き起こし（固定表示） */}
          <div className="px-10 pb-10 space-y-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <MessageSquare size={14} /> Transcription / 発話内容
             </h3>
             <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-lg text-blue-900 font-medium leading-relaxed italic">
               「{data.text}」
             </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 bg-gray-50 border-t flex justify-center">
          <button onClick={onClose} className="px-12 py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg">
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// グラフ部分をコンポーネント化して再利用
function ProbabilityChart({ data }: { data: any }) {
  const chartData = [
    { name: '健康', value: data.healthy, color: '#10B981' },
    { name: 'MCI', value: data.MCI, color: '#F59E0B' },
    { name: '認知症', value: data.Dementia, color: '#EF4444' },
  ];
  return (
    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
          <XAxis type="number" domain={[0, 1]} hide />
          <YAxis dataKey="name" type="category" tick={{fontWeight: 'bold', fontSize: 12}} width={80} />
          <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={35}>
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="text-indigo-500 mb-3 bg-indigo-50 w-fit p-2 rounded-lg">{icon}</div>
      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-xl font-black text-gray-800">{value}</p>
    </div>
  );
}
