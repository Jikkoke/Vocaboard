import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 実際には FormData を受け取るが、今は中身を無視して「解析したフリ」をする
    const formData = await request.formData();
    console.log("データをアーカイブしました:", formData.get('audio_file'));

    // 擬似的な待ち時間（0.5秒）を作る（解析中...のUIを確認するため）
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 要件定義に基づいたダミーデータを返す
    const mockResponse = {
      status: "success",
      healthy: 0.04,
      MCI: 0.10,
      Dementia: 0.86,
      details: {
        ttr: 0.52,
        abstract_rate: 0.03,
        silence_ratio: 0.08,
        freq_sd: 30.0,
        speed: 5.3
      },
      Conversation: "今日はとても天気が良くて、散歩に行きたい気分ですね。",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: '送信に失敗しました' },
      { status: 500 }
    );
  }
}