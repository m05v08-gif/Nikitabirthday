export function ArtBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Blobs — colors come from CSS variables per theme */}
      <div className="art-blob art-blob-a" />
      <div className="art-blob art-blob-b" />
      <div className="art-blob art-blob-c" />
      <div className="art-blob art-blob-d" />

      {/* Poster strokes */}
      <div className="absolute inset-x-6 top-24 h-px bg-[color:var(--color-stroke)] opacity-60" />
      <div className="absolute -right-8 top-40 h-40 w-40 rotate-12 rounded-[2rem] border border-[color:var(--color-stroke)] opacity-35" />
      <div className="absolute -left-10 bottom-32 h-28 w-44 -rotate-6 rounded-full border border-[color:var(--color-stroke)] opacity-25" />

      <div className="bg-noise absolute inset-0" />
    </div>
  );
}
