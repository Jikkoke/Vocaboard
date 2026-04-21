'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Analysis_demo from '@/components/Analysis_demo';

export default function AnalysisDemoPage() {
  const router = useRouter();
  
  // ページが表示されたら即座にモーダルが開いている状態にする
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Analysis_demo 
        isOpen={true} 
        onClose={() => router.push('/')} // 閉じたらダッシュボードへ戻る
      />
    </div>
  );
}
