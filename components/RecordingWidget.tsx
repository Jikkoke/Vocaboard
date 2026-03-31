"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save } from 'lucide-react';

export default function RecordingWidget({ onStatusChange, onRecordingComplete }: { onStatusChange?: (is: boolean) => void, onRecordingComplete?: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 【最重要】タイマー管理：isRecordingのフラグだけで完全に制御する
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording) {
      setDuration(0); // 開始時にリセット
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      // 録音停止時、ここで確実にタイマーを止める
      if (interval) clearInterval(interval);
    }

    // クリーンアップ関数：コンポーネント消滅時や録音停止時に確実に実行される
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    onStatusChange?.(isRecording);
  }, [isRecording, onStatusChange]);

  const stopAllMediaResources = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: {
    channelCount: 1,           // モノラルを強制
    echoCancellation: true,    // スピーカー音の回り込み防止
    noiseSuppression: true,    // ノイズ除去
    autoGainControl: true      // 音量を自動調整（解析精度向上）
  } 
});
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      if (audioContext.state === 'suspended') await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      
      // 【ご指定】Gain: 1.2
      gainNode.gain.value = 1.2; 
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8; 
      
      source.connect(gainNode);
      gainNode.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        onRecordingComplete?.(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      const updateVolume = () => {
        if (!analyserRef.current || !audioContextRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const max = Math.max(...Array.from(dataArray));
        // 【ご指定】倍率: 1.0
        setVolume(Math.min(100, (max / 255) * 100 * 1.0));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

    } catch (err) {
      alert("マイクを起動できませんでした。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    // ステートを false にするだけで、useEffect内のタイマー停止ロジックが自動発火する
    setIsRecording(false);
    setVolume(0);
    stopAllMediaResources();
  };

  const saveFile = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VocaBoard_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (s: number) => {
    return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  };

  return (
    <div className="mt-4 p-4 bg-white/95 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 min-w-[90px]">
          <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className={`text-sm font-bold ${isRecording ? 'text-red-600' : 'text-gray-500'}`}>{isRecording ? '録音中' : '停止中'}</span>
        </div>

        <div className="flex-1 flex items-center gap-8">
          <span className={`text-2xl font-mono font-bold w-[70px] ${isRecording ? 'text-gray-900' : 'text-gray-400'}`}>
            {formatTime(duration)}
          </span>
          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-red-500 transition-all duration-75`} 
              style={{ width: `${volume}%` }} 
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isRecording && audioBlob && (
            <button onClick={saveFile} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:scale-95"><Save size={20} /></button>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-900 text-white'}`}
          >
            {isRecording ? <><Square size={18} fill="currentColor" /> 停止</> : <><Mic size={18} /> 録音</>}
          </button>
        </div>
      </div>
    </div>
  );
}
