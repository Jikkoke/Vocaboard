import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // --- 【受信確認ログ】ここを追加 ---
    const audio = formData.get('audio_file') as File;
    const image = formData.get('image_file') as File;

    console.log('--- VocaSense Data Received ---');
    console.log(`Audio File: ${audio?.name} (${audio?.size} bytes)`);
    console.log(`Image File: ${image?.name} (${image?.size} bytes)`);
    console.log('Timestamp:', new Date().toISOString());
    // ------------------------------

    // 擬似的な待ち時間
    await new Promise((resolve) => setTimeout(resolve, 800));

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
      Conversation: "Vercelサーバーで正常にデータを受信しました。",
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}