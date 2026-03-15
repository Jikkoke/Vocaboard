"use client";
import React, { useRef, useState } from 'react';
import HandwritingCanvas, { HandwritingCanvasHandle } from './HandwritingCanvas';
import { Trash2, PlusCircle } from 'lucide-react';

export default function ActionWidget({ onAddNote }: { onAddNote: (url: string) => void }) {
  const canvasHandleRef = useRef<HandwritingCanvasHandle>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // ここでサイズを一括管理
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 350;

  const handleClear = () => {
    canvasHandleRef.current?.clear();
    setHasDrawn(false);
  };

  const handleAdd = () => {
    const dataUrl = canvasHandleRef.current?.getDataUrl();
    if (dataUrl) {
      onAddNote(dataUrl);
      handleClear();
    }
  };

  return (
    <div className="flex flex-col h-full w-full gap-4">
      {/* 描画エリアの枠サイズも変数に合わせる */}
      <div 
        className="flex-shrink-0 mx-auto shadow-xl rounded-2xl border border-gray-200 overflow-hidden bg-white" 
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        <HandwritingCanvas 
          ref={canvasHandleRef} 
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onStroke={() => setHasDrawn(true)} 
        />
      </div>
      
      {/* ボタンエリア */}
      <div className="flex flex-row gap-3 flex-1 min-h-0">
        <button 
          onClick={handleClear}
          disabled={!hasDrawn}
          className={`flex-1 flex flex-col items-center justify-center gap-2 text-sm font-bold rounded-2xl transition-all border-2
            ${hasDrawn ? 'bg-white border-gray-300 text-gray-500 active:scale-95' : 'bg-gray-100 text-gray-300 opacity-50'}`}
        >
          <Trash2 size={20} />
          <span>クリア</span>
        </button>

        <button 
          onClick={handleAdd}
          disabled={!hasDrawn}
          className={`flex-[3] flex flex-col items-center justify-center gap-2 text-xl font-black rounded-3xl transition-all shadow-lg
            ${hasDrawn ? 'bg-blue-600 text-white active:scale-[0.98]' : 'bg-gray-300 text-gray-500'}`}
        >
          <PlusCircle size={28} />
          <span>追加</span>
        </button>
      </div>
    </div>
  );
}