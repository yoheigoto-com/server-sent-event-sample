import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const text =
    "吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。";

  const stream = new ReadableStream({
    start(controller) {
      let index = 0;
      const intervalId = setInterval(() => {
        if (index < text.length) {
          controller.enqueue(`data: ${text[index]}\n\n`);
          index++;
        } else {
          controller.enqueue(`data: [DONE]\n\n`); // ChatGPTっぽく終端文字を挿入
          clearInterval(intervalId);
          controller.close();
        }
      }, 50);

      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
}
