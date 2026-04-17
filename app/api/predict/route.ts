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
  text: result.text || "文字起こしデータが空です",
  
  // --- 音声解析の結果 (横スクロールの1枚目用) ---
  audio: {
    prediction: result.pred_audio || "不明",
    score: result.score_audio ?? 0,
    probabilities: {
      healthy: (result.normal_audio ?? 0) / 100,
      MCI: (result.MCI_audio ?? 0) / 100,
      Dementia: (result.dementia_audio ?? 0) / 100,
    },
    features: {
      f0_std: result.features?.f0_std ?? 0,
      speed: result.features?.articulation_rate ?? 0,
      silence: result.features?.silence_ratio ?? 0,
    }
  },

  // --- 言語解析の結果 (横スクロールの2枚目用) ---
  lang: {
    prediction: result.pred_lang || "不明",
    score: result.score_lang ?? 0,
    probabilities: {
      healthy: (result.normal_lang ?? 0) / 100,
      MCI: (result.MCI_lang ?? 0) / 100,
      Dementia: (result.dementia_lang ?? 0) / 100,
    },
    features: {
      filler: result.features?.filler_rate ?? 0,
      abstract: result.features?.abstract_rate ?? 0,
      depth: result.features?.max_depth ?? 0,
      noun: result.features?.noun_ratio ?? 0,
    }
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
