"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, CheckCircle, RotateCcw } from 'lucide-react';

export default function VoiceRegisterPage() {
  const [status, setStatus] = useState<'idle' | 'recording' | 'finished'>('idle');
  const [countdown, setCountdown] = useState(10);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.onstop = () => setStatus('finished');
      mediaRecorder.start();
      setStatus('recording');
      setCountdown(10);
    } catch (err) {
      alert("マイクのアクセスを許可してください");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'recording' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && status === 'recording') {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    }
    return () => clearInterval(timer);
  }, [status, countdown]);

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center relative overflow-hidden p-6">
      
      {/* デモ用：録音中のサイド発光（赤） */}
      <AnimatePresence>
        {status === 'recording' && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.3, 0.1] }} exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="fixed inset-y-0 left-0 w-3 bg-red-500 shadow-[4px_0_20px_rgba(239,68,68,0.3)] z-50"
            />
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.3, 0.1] }} exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="fixed inset-y-0 right-0 w-3 bg-red-500 shadow-[-4px_0_20px_rgba(239,68,68,0.3)] z-50"
            />
          </>
        )}
      </AnimatePresence>

      <div className="max-w-md w-full text-center space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">音声データの登録</h1>
          <p className="text-gray-500 font-medium">10秒間のサンプル録音を行います</p>
        </div>

        <div className="relative flex justify-center items-center py-10">
          {status === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-32 h-32 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-200 flex flex-col items-center justify-center hover:bg-blue-700 transition-all"
            >
              <Mic size={40} />
              <span className="text-xs font-bold mt-1">START</span>
            </motion.button>
          )}

          {status === 'recording' && (
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-red-100 rounded-full"
              />
              <div className="w-32 h-32 rounded-full bg-red-600 text-white flex items-center justify-center relative shadow-lg shadow-red-200">
                <span className="text-4xl font-black font-mono">{countdown}</span>
              </div>
            </div>
          )}

          {status === 'finished' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-green-50 border-4 border-green-500 flex items-center justify-center mb-6">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">登録完了</h2>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <RotateCcw size={16} /> 再録音
              </button>
            </motion.div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest font-bold">
            Analysis Protocol: VocaSense-Diarization-v3
          </p>
        </div>
      </div>
    </div>
  );
}
