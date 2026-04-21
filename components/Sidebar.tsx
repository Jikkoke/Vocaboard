"use client";
import React from "react";
import Link from 'next/link';
import { Menu, X, Home, BarChart2, Mic } from 'lucide-react';
import { usePathname } from 'next/navigation'; // 1. インポートを確認

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  // --- ここで変数を定義します (returnの中ではなく、関数の直下) ---
  const linkBaseStyle = "flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors cursor-pointer";
  const activeStyle = "bg-blue-50 text-blue-600";
  const inactiveStyle = "text-gray-500 hover:bg-gray-50";
  const pathname = usePathname();
  // ---------------------------------------------------------
  return (
    <>
      {/* ハンバーガーボタン: サイドバーの外に出しておく */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-md border border-gray-200 active:scale-90 transition-transform"
        aria-label="メニュー開閉"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* バックドロップ（背景の暗り）: isOpenの時だけ不透明度を上げる */}
      <div 
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* サイドバー本体: transform を使って画面外(左)に隠す */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6 pt-24">
          <div className="mb-8 px-2">
            <h2 className="text-xl font-black text-blue-600 tracking-tighter">VocaBoard</h2>
            <p className="text-xs text-gray-400 font-medium">Cognitive Analysis System</p>
          </div>

          <nav className="space-y-2 flex-1">
            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-2xl font-bold cursor-pointer">
              <Home size={22} /> 
              <span>ホーム</span>
            </div>
            
            <Link 
              href="/register" 
              onClick={() => setIsOpen(false)}
              className={`${linkBaseStyle} ${pathname === "/register" ? activeStyle : inactiveStyle}`}
            >
              <Mic size={22} /> 
              <span>音声登録</span>
            </Link>

            <Link 
              href="/analysis-demo" 
              onClick={() => setIsOpen(false)} // モバイル用メニュー等を閉じる既存処理
              className={`${linkBaseStyle} ${pathname === "/analysis-demo" ? activeStyle : inactiveStyle}`}
            >
              <PieChart size={22} /> 
              <span>解析イメージ (Demo)</span>
            </Link>
            
            <div className="flex items-center gap-3 p-4 text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer">
              <BarChart2 size={22} /> 
              <span>解析画面（グラフ）</span>
            </div>
          </nav>

          {/* 下部にステータスなどを表示するスペースを確保 */}
          <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              VocaSense Engine Online
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
