"use client";

import React from 'react';
import { X, Brain, Activity, Clock, Zap, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface AnalysisReportModalProps {
  data: any;
  onClose: () => void;
}

export default function AnalysisReportModal({ data, onClose }: AnalysisReportModalProps) {
  if (!data) return null;

  // グラフ用データ整形
  const chartData = [
    { name: '健康', value: data.healthy, color: '#10B981' },
    { name: 'MCI', value: data.MCI, color: '#F59E0B' },
    { name: '認知症', value: data.Dementia, color: '#EF4444' },
  ];

  return (
    <div className="fixed inset-0 z- bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col scale-in-center">
        
        {/* ヘッダー */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">VocaSense 解析レポート</h2>
            <p className="text-sm text-gray-500 font-medium">
              {new Date(data.timestamp).toLocaleString('ja-JP')} 実施
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-all active:scale-90">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* 左側：推論確率グラフ */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Probability / 推論確率</h3>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" domain={} hide />
                    <YAxis dataKey="name" type="category" tick={{fontWeight: 'bold', fontSize: 14}} width={80} />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="value" radius={} barSize={45}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右側：詳細指標カード */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Detailed Metrics / 詳細指標</h3>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard icon={<Brain size={20}/>} label="語彙多様性" value={data.details.ttr.toFixed(2)} />
                <MetricCard icon={<Zap size={20}/>} label="発話速度" value={`${data.details.speed}/s`} />
                <MetricCard icon={<Clock size={20}/>} label="沈黙率" value={`${(data.details.silence_ratio * 100).toFixed(1)}%`} />
                <MetricCard icon={<Activity size={20}/>} label="抽象語率" value={`${(data.details.abstract_rate * 100).toFixed(1)}%`} />
              </div>
            </div>
          </div>

          {/* 下部：書き起こしテキスト */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <MessageSquare size={14} /> Transcription / 発話内容
            </h3>
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-lg text-blue-900 font-medium leading-relaxed italic">
              「{data.Conversation}」
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 bg-gray-50 border-t flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// 指標カード用サブコンポーネント
function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="text-indigo-500 mb-3 bg-indigo-50 w-fit p-2 rounded-lg">{icon}</div>
      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-xl font-black text-gray-800">{value}</p>
    </div>
  );
}