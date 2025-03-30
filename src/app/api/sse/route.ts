import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const text =
    "吾輩は猫である。名前はまだない。どこで生れたか頓と見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ち付いて書生の顔を見たのがいわゆる人間というものの見始であろう。この時妙なものだと思った感じが今でも残っている。第一毛を以て装飾されべきはずの顔がつるつるしてまるで薬缶だ。その後猫にも大分逢ったがこんな片輪には一度も出会わした事がない。のみならず顔の真中が余りに突起している。そうしてその穴の中から時々ぷうぷうと烟を吹く。どうも咽せぽくて実に弱った。これが人間の飲む烟草というものである事は漸くこの頃知った。";

  const stream = new ReadableStream({
    start(controller) {
      let index = 0;
      const interval = setInterval(() => {
        if (index >= text.length) {
          clearInterval(interval);
          controller.enqueue("data: [DONE]\n\n");
          controller.close();
          return;
        }

        const char = text[index++];
        controller.enqueue(`data: ${char}\n\n`);
      }, 100);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
}
