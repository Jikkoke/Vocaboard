"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StickyNoteArea from '@/components/StickyNoteArea';
import ActionWidget from '@/components/ActionWidget';
import RecordingWidget from '@/components/RecordingWidget';
import AnalysisReportModal from '@/components/AnalysisReportModal';
import { Send, Mic, PlusCircle, CheckCircle2 } from 'lucide-react';

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
    // 1. バリデーションチェック
    if (!latestAudioBlob || notes.length === 0) 
      alert(`準備ができていません。\n録音データ: ${!!latestAudioBlob ? "OK" : "なし"});
      return;
    }

    setIsAnalyzing(true);
    console.log("解析プロセス開始...");

    try {
      const formData = new FormData();
      
      // 音声の追加
      formData.append('file', latestAudioBlob, 'recording.wav');
      
      // // 【修正ポイント1】最新の付箋は notes です
      // const latestNote = notes[1];
      // console.log("画像取得開始:", latestNote.id);

      // // 画像をBlobに変換して追加
      // const resImg = await fetch(latestNote.imageUrl);
      // const imageBlob = await resImg.blob();
      // formData.append('image_file', imageBlob, 'drawing.png');

      // 2. Vercel API への送信
      console.log("Vercelへデータ送信中...");
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
        cache: 'no-store' // キャッシュを無効化
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`サーバーエラー: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("解析結果受信:", result);
      
      // Stateの更新
      setAnalysisResult(result);
      
      // 受信確認用アラート
      alert(`解析完了！\n判定: ${result.healthy > 0.5 ? "健康" : "要確認"}\nConversation: ${result.Conversation.substring(0, 20)}...`);

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
      
      {/* 1. 解析中オーバーレイ */}
      {isAnalyzing && (
        // 【修正ポイント2】z- と記述（括弧が必要）
        <div className="fixed inset-0 z- bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold tracking-widest animate-pulse">VocaSense 解析中...</p>
        </div>
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="absolute top-0 left-0 w-full h-16 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-2xl font-bold text-gray-700 tracking-wider uppercase">VocaBoard</h1>
      </div>

      <main className="flex flex-1 h-full p-4 pt-16 gap-6 overflow-hidden">
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

        <section className="h-full flex flex-col pb-2 min-h-0 w-[550px] flex-shrink-0 gap-6">
          <div className="flex-none bg-white p-4 rounded-[40px] border border-gray-200 shadow-sm">
            <ActionWidget onAddNote={handleAddNote} />
          </div>

          <div className="flex-1 flex flex-col justify-center px-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !latestAudioBlob || notes.length === 0}
              className={`w-full py-10 rounded-[40px] font-black text-4xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95
                ${(!latestAudioBlob || notes.length === 0) 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-2 border-dashed border-gray-200 shadow-none' 
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-blue-500/40 hover:-translate-y-1'}`}
            >
              <Send size={40} />
              <span>VocaSense 解析</span>
            </button>

            <div className="mt-6 flex flex-col items-center gap-2">
              {!latestAudioBlob ? (
                <span className="text-red-400 font-bold flex items-center gap-2 bg-red-50 px-4 py-1 rounded-full text-sm">
                  <Mic size={16} /> 録音を停止してデータを確定させてください
                </span>
              ) : notes.length === 0 ? (
                <span className="text-orange-400 font-bold flex items-center gap-2 bg-orange-50 px-4 py-1 rounded-full text-sm">
                  <PlusCircle size={16} /> メモを描いて「追加」してください
                </span>
              ) : (
                <span className="text-emerald-500 font-bold flex items-center gap-2 bg-emerald-50 px-4 py-1 rounded-full text-sm animate-bounce">
                  <CheckCircle2 size={16} /> 解析の準備ができました！
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
