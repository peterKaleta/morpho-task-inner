"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{ margin: "4rem auto", maxWidth: "40rem", padding: "0 1rem" }}
        >
          <h1>Application error</h1>
          <p>{error.message || "A server error interrupted the app."}</p>
          <button onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  );
}
