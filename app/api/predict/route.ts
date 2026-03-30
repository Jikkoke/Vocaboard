import { NextResponse } from 'next/server';

// あなたの ngrok URL (末尾に /predict がついているか確認してください)
const JETSON_URL = "https://tetrastichous-workless-marty.ngrok-free.dev/predict";

export async function POST(request: Request) {
  try {
    // 1. ブラウザからのデータ受信
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;

    if (!audioFile) {
      console.error("Vercel Error: No audio_file in request");
      return NextResponse.json({ error: "音声ファイルが見つかりません" }, { status: 400 });
    }

    // 2. Jetson (Flask) へ送るための準備
    const jetsonFormData = new FormData();
    // server.py の仕様に合わせて 'audio_file' というキー名で音声をセット
    jetsonFormData.append('file', audioFile, 'recording.wav');

    console.log(`Forwarding to Jetson: ${audioFile.size} bytes`);

    // 3. Jetson への転送実行
    const response = await fetch(JETSON_URL, {
      method: 'POST',
      body: jetsonFormData,
      headers: {
        'ngrok-skip-browser-warning': 'true', // ngrokの警告画面を回避
      },
      cache: 'no-store',
    });

    // 4. 通信エラーのチェック
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jetson Response Error (${response.status}): ${errorText}`);
    }

    // 5. 解析結果の受信
    const result = await response.json();
    
    // 【重要】VercelのログにJetsonから届いた生のデータを全出しする
    // これで、どの値が undefined になっているか確認できます
    console.log("Raw Result from Jetson:", JSON.stringify(result, null, 2));

    // もし Jetson 側でエラーが発生していた場合
    if (result.error) {
      return NextResponse.json({ error: `Jetson Logic Error: ${result.error}` }, { status: 500 });
    }

    // 6. フロントエンド（モーダル）が期待する形式に整形
    // オプショナルチェイニング (?.) と Null合体演算子 (??) を多用して、
    // どんなにデータが欠けていても「undefined」を返さないようにガードします。
    const formattedResponse = {
      status: "success",
      // Healthy (normal), MCI, Dementia の各確率を 0.0 ~ 1.0 の範囲に直す
      healthy: (result.normal ?? 0) / 100,
      MCI: (result.MCI ?? 0) / 100,
      Dementia: (result.dementia ?? 0) / 100,
      // 文字起こしテキスト
      Conversation: result.text || "文字起こしデータが空です",
      // スコア
      score: result.score ?? 0,
      // 各種詳細パラメータ
      details: {
        ttr: result.features?.ttr ?? 0,
        speed: result.features?.articulation_rate ?? 0,
        silence_ratio: result.features?.silence_ratio ?? 0,
        abstract_rate: result.features?.abstract_rate ?? 0,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(formattedResponse);

  } catch (error: any) {
    // 全てのエラーをキャッチして Vercel ログに出力
    console.error('Final Proxy Error:', error.message);
    return NextResponse.json(
      { error: error.message || "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}