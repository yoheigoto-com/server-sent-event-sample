"use client";

import { useEffect, useState } from "react";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@microsoft/fetch-event-source";

class RetriableError extends Error {}
class FatalError extends Error {}

export default function Home() {
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // クリーンアップ関数で以前の接続を終了できるようにするための変数
    let controller: AbortController | null = null;

    if (isStreaming) {
      controller = new AbortController();

      const startFetching = async () => {
        try {
          await fetchEventSource("/api/sse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: "hoge" }),
            signal: controller?.signal,
            async onopen(response) {
              if (
                response.ok &&
                response.headers.get("content-type") === EventStreamContentType
              ) {
                return;
              } else if (
                response.status >= 400 &&
                response.status < 500 &&
                response.status !== 429
              ) {
                throw new FatalError();
              } else {
                throw new RetriableError();
              }
            },
            onmessage(msg) {
              if (msg.event === "FatalError") {
                throw new FatalError(msg.data);
              }
              setMessage((prev) => prev + msg.data);

              // DONE メッセージを受け取ったら自動的にストリーミングを終了
              if (msg.data === "[DONE]") {
                setIsStreaming(false);
              }
            },
            onclose() {
              setIsStreaming(false);
            },
            onerror(err) {
              setIsStreaming(false);
              if (err instanceof FatalError) {
                throw err;
              }
            },
          });
        } catch (error) {
          console.error("Streaming error:", error);
          setIsStreaming(false);
        }
      };

      startFetching();
    }

    // クリーンアップ関数
    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [isStreaming]);

  const onClick = () => {
    setMessage("");
    setIsStreaming(true);
  };

  return (
    <div>
      <button onClick={onClick} disabled={isStreaming}>
        {isStreaming ? "STREAMING..." : "START"}
      </button>
      <p>{message}</p>
    </div>
  );
}
