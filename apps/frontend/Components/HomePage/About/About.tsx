export default function About() {
  return (
    <section className="w-full bg-white text-neutral-800 py-12 sm:py-20 px-4 sm:px-10">
      <div className="max-w-4xl mx-auto text-center py-8 sm:py-14 space-y-5 sm:space-y-6">

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-gray-900">About</h2>

        {/* Paragraphs */}
        <p className="text-base sm:text-lg leading-relaxed">
          At <span className="font-semibold text-gray-900">Wallpaper Heaven</span>, we don’t just design walls —
          we awaken them. Every hue we choose, every texture we weave, carries the pulse of passion and the echo of lived stories.
        </p>

        <p className="text-base sm:text-lg leading-relaxed">
          We create for the fearless — the ones who have loved deeply, dreamed boldly, and carved beauty from the chaos.
        </p>

        <p className="text-base sm:text-lg leading-relaxed">
          To us, a wall is more than a surface — it’s a canvas of identity, a reflection of soul. Our craft is not just about aesthetics; it’s about connection.
        </p>

        <p className="text-base sm:text-lg leading-relaxed italic text-neutral-700">
          <span className="not-italic font-semibold text-black">Connection</span> to moments.{" "}
          <span className="not-italic font-semibold text-black">To memories.</span>{" "}
          <span className="not-italic font-semibold text-black">To meaning.</span>{" "}
          When our wallpapers embrace your space, they don’t just fill it — they transform it.
        </p>

        <p className="text-base sm:text-lg leading-relaxed">
          Because we believe every home should feel like a heartbeat — and every person, like a masterpiece.
        </p>
      </div>
    </section>
  );
}
