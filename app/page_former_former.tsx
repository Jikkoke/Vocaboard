"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StickyNoteArea from '@/components/StickyNoteArea';
import ActionWidget from '@/components/ActionWidget';
import RecordingWidget from '@/components/RecordingWidget';
import AnalysisReportModal from '@/components/AnalysisReportModal';
import { Send, Mic, PlusCircle, CheckCircle2, MonitorPlay } from 'lucide-react';

export type Note = {
  id: string;
  imageUrl: string;
  timestamp: Date;
};

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestAudioBlob, setLatestAudioBlob] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // --- 追加: デモ管理用のState ---
  const [selectedDemoId, setSelectedDemoId] = useState<string>("1");
  const demoOptions = ["1", "2", "3", "4", "5"];

  const handleAddNote = (imageUrl: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      imageUrl,
      timestamp: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  // 送信ボタン押下時の処理
  const handleAnalyze = async () => {
    // バリデーション: 付箋が1枚以上あること、かつ（録音済み または デモ番号選択済み）
    if (notes.length === 0) {
      alert("メモを追加してください。");
      return;
    }

    setIsAnalyzing(true);
    console.log(`解析プロセス開始... Demo ID: ${selectedDemoId}`);

    try {
      const formData = new FormData();
      
      // 1. 音声データの追加（録音がある場合のみ。なければサーバー側でdemo_idを優先する運用）
      if (latestAudioBlob) {
        formData.append('file', latestAudioBlob, 'recording.wav');
      }
      
      // 2. 選択された番号を送信（Jetson側でこれを受け取り音声を選択）
      formData.append('demo_id', selectedDemoId);
      
      // 3. 最新の付箋情報（必要に応じて）
      const latestNote = notes[0];
      formData.append('note_id', latestNote.id);

      // 4. Vercel / Jetson API への送信
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`サーバーエラー: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      alert(`解析完了！\n判定: ${result.healthy > 0.5 ? "健康" : "要確認"}`);

    } catch (error: any) {
      console.error("解析エラー:", error);
      alert(`解析に失敗しました:\n${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`flex h-screen w-full bg-[#F8F9FA] overflow-hidden relative transition-all duration-700 ${
      isRecording ? 'shadow-[inset_0_0_60px_rgba(239,68,68,0.5)]' : ''
    }`}>
      
      {/* 解析中オーバーレイ */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold tracking-widest animate-pulse">VocaSense 解析中...</p>
        </div>
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* ヘッダータイトル */}
      <div className="absolute top-0 left-0 w-full h-16 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-2xl font-bold text-gray-700 tracking-wider uppercase">VocaBoard</h1>
      </div>

      <main className="flex flex-1 h-full p-4 pt-16 gap-6 overflow-hidden">
        {/* 左側：メイン描画エリア */}
        <section className={`flex-1 h-full flex flex-col min-h-0 overflow-hidden transition-all duration-500 rounded-[40px] border shadow-inner
          ${isRecording ? 'border-red-300 bg-red-50/20' : 'border-gray-200 bg-white/40'}`}>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <StickyNoteArea notes={notes} onDeleteNote={handleDeleteNote} />
          </div>
          
          <div className="p-4 bg-white/60 backdrop-blur-sm border-t border-gray-100">
            <RecordingWidget 
              onStatusChange={setIsRecording} 
              onRecordingComplete={(blob) => setLatestAudioBlob(blob)} 
            />
          </div>
        </section>

        {/* 右側：操作パネル */}
        <section className="h-full flex flex-col pb-2 min-h-0 w-[500px] flex-shrink-0 gap-3">
          
          {/* 追加：デモ番号選択スロット */}
          <div className="flex-none bg-white p-6 rounded-[40px] border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 px-2">
              <MonitorPlay size={20} className="text-blue-500" />
              <h2 className="text-sm font-black text-gray-600 uppercase tracking-tighter">Demo Audio Select</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {demoOptions.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedDemoId(num)}
                  className={`py-4 rounded-2xl font-black text-xl transition-all active:scale-90 ${
                    selectedDemoId === num 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center font-medium">
              ※番号を選択するとJetson側の対応する音声ファイルがロードされます
            </p>
          </div>

          <div className="flex-none bg-white p-4 rounded-[40px] border border-gray-200 shadow-sm">
            <ActionWidget onAddNote={handleAddNote} />
          </div>

          <div className="flex-1 flex flex-col justify-center px-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || notes.length === 0}
              className={`w-full py-5 rounded-[40px] font-black text-4xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95
                ${(notes.length === 0) 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-2 border-dashed border-gray-200 shadow-none' 
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-blue-500/40 hover:-translate-y-1'}`}
            >
              <Send size={28} />
              <span>VocaSense 解析</span>
            </button>

            <div className="mt-6 flex flex-col items-center gap-2">
              {notes.length === 0 ? (
                <span className="text-orange-400 font-bold flex items-center gap-2 bg-orange-50 px-4 py-1 rounded-full text-sm">
                  <PlusCircle size={16} /> メモを描いて「追加」してください
                </span>
              ) : !latestAudioBlob ? (
                <span className="text-blue-500 font-bold flex items-center gap-2 bg-blue-50 px-4 py-1 rounded-full text-sm">
                  <MonitorPlay size={16} /> デモ番号 {selectedDemoId} で実行可能です
                </span>
              ) : (
                <span className="text-emerald-500 font-bold flex items-center gap-2 bg-emerald-50 px-4 py-1 rounded-full text-sm animate-bounce">
                  <CheckCircle2 size={16} /> 録音データで解析準備完了！
                </span>
              )}
            </div>
          </div>
        </section>
      </main>

      {analysisResult && (
        <AnalysisReportModal 
          data={analysisResult} 
          onClose={() => setAnalysisResult(null)} 
        />
      )}      
    </div>
  );
}
