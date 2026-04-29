import { NextResponse } from 'next/server';

// JetsonのURL
const JETSON_URL = "https://tetrastichous-workless-marty.ngrok-free.dev/predict";

export async function POST(request: Request) {
  try {
    // 現在日付の明記（ルール準拠）
    console.log(`[2026-04-29] Triggering Jetson analysis...`);

    // 1. ブラウザからはファイルを受け取らず、リクエストのみを受信
    // (必要に応じてリクエストボディからファイル名などを指定させることも可能ですが、今回はトリガーに特化)

    // 2. Jetsonへのリクエスト実行
    // ファイルを送らないため、JSON形式で通知、あるいはシンプルなPOSTを送信
    const response = await fetch(JETSON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      // Jetson側で「どのファイルを解析するか」の指定が必要な場合はここに記述
      body: JSON.stringify({ action: "start_analysis" }), 
      cache: 'no-store',
    });

    // 3. 通信エラーのチェック
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jetson Response Error (${response.status}): ${errorText}`);
    }

    // 4. 解析結果の受信 (Jetson側でファイル解析が終わるまで待機)
    const result = await response.json();
    console.log("Raw Result from Jetson:", JSON.stringify(result, null, 2));

    if (result.error) {
      return NextResponse.json({ error: `Jetson Logic Error: ${result.error}` }, { status: 500 });
    }

    // 5. フロントエンドが期待する形式に整形
    const formattedResponse = {
      status: "success",
      text: result.text || "文字起こしデータが空です",
      
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
    console.error('Final Proxy Error:', error.message);
    return NextResponse.json(
      { error: error.message || "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}
