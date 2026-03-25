"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import StickyNoteArea from '@/components/StickyNoteArea';
import ActionWidget from '@/components/ActionWidget';
import RecordingWidget from '@/components/RecordingWidget';
import { Send } from 'lucide-react';
import AnalysisReportModal from '@/components/AnalysisReportModal';

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

  const handleAnalyze = async () => {
    if (!latestAudioBlob) return alert("解析する音声がありません。録音してください。");
    if (notes.length == 0) return alert("解析するメモがありません。");

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('audio_file', latestAudioBlob, 'recording.wav');
      
      const latestNote = notes;
      const resImg = await fetch(latestNote.imageUrl);
      const imageBlob = await resImg.blob();
      formData.append('image_file', imageBlob, 'drawing.png');

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("解析サーバーとの通信に失敗しました");

      const result = await response.json();
      console.log("解析成功:", result);
      alert(`解析結果を受信しました: Dementia ${Math.round(result.Dementia * 100)}%`);

    } catch (error) {
      console.error(error);
      alert("エラーが発生しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    // isRecording が true の時だけ「リング状のグロウ効果」を付与
    <div className={`flex h-screen w-full bg-[#F8F9FA] overflow-hidden relative transition-all duration-700 ${
      isRecording ? 'shadow-[inset_0_0_60px_rgba(239,68,68,0.5)]' : ''
    }`}>

      {isAnalyzing && (
        <div className="fixed inset-0 z- bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold tracking-widest animate-pulse">VocaSense 解析中...</p>
          </div>
        )}

      {analysisResult && (
        <AnalysisReportModal 
          data={analysisResult} 
          onClose={() => setAnalysisResult(null)} 
        />
      )}      

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="absolute top-0 left-0 w-full h-16 flex items-center justify-center pointer-events-none z-10">
        <h1 className="text-2xl font-bold text-gray-700 tracking-wider">VocaBoard</h1>
      </div>

      <main className="flex flex-1 h-full p-4 pt-16 gap-6 overflow-hidden">
        <section className={`flex-1 h-full flex flex-col min-h-0 overflow-hidden transition-all duration-500 rounded-3xl border
          ${isRecording ? 'border-red-300 bg-red-50/20' : 'border-gray-200 bg-white/40'}`}>
          
          <div className="flex-1 overflow-y-auto pr-2 pb-2">
            <StickyNoteArea notes={notes} onDeleteNote={handleDeleteNote} />
          </div>
          
          {/* 修正されたウィジェット */}
          <RecordingWidget
            onStatusChange={setIsRecording}
            onRecordingComplete={(blob) => setLatestAudioBlob(blob)}
          />
        </section>

        {/* 右側：キャンバス固定エリア */}
        <section className="h-full flex flex-col pb-2 min-h-0 w-[500px] flex-shrink-0">
          <ActionWidget onAddNote={handleAddNote} />

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !latestAudioBlob || notes.length === 0}
            className={`w-full py-6 rounded-3xl font-black tex-2xl flex items-center justify-center gap-3 shadow-xl transition-all active;scale-95
              ${(!latestAudioBlob || notes.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-2xl hover:-translate-y-1'}`}
          >
            <Send size={24} />
            VocaSense 解析
          </button>
        </section>
      </main>
    </div>
  );
}