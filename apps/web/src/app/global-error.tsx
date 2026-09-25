'use client';

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
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>A critical error occurred</h2>
          <p>We apologize for the inconvenience.</p>
          <button 
            onClick={() => reset()}
            style={{ padding: '8px 16px', marginTop: '16px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
