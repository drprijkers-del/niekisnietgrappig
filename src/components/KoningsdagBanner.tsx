export default function KoningsdagBanner() {
  return (
    <div className="relative z-20 overflow-hidden border-b border-orange-300/40 bg-gradient-to-r from-[#FF6B1A] via-[#FFA24A] to-[#FF6B1A] py-2.5 text-center text-[13px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_4px_20px_-4px_rgba(255,107,26,0.6)]">
      <span className="mr-2" aria-hidden="true">👑</span>
      <span>Koningsdag Special</span>
      <span className="mx-2 opacity-70">·</span>
      <span className="font-medium normal-case tracking-normal">Vandaag is Nederland oranje</span>
      <span className="ml-2" aria-hidden="true">🧡</span>
    </div>
  );
}
