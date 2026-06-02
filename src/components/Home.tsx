import CardDeck from "./CardDeck";

export default function HomeSection() {
  return (
    <div className="flex-1 w-full flex flex-col justify-between items-center py-3 px-6 text-center">
      {/* Top Header */}
      <header className="w-full max-w-6xl items-center text-sm">
        <span className="font-bold block">Colombo, Sri Lanka</span>
        <a href="mailto:hello@kavindushehan.site" className="opacity-40 transition-opacity hover:underline">
          hello@kavindushehan.site
        </a>
      </header>

      {/* Main Hero Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Name Title */}
        <span className="text-5xl md:text-9xl font-bold opacity-80 mb-4">I'm</span>
        <h1 className="text-5xl md:text-[6.5rem] lg:text-[7.5rem] font-bold mb-16 text-primary leading-none">Kavindu Shehan</h1>

        {/* Card Deck Section */}
        <CardDeck />

        {/* Subtitle / Role */}
        <h2 className="mt-20 text-6xl md:text-[6.5rem] lg:text-[7.5rem] font-black text-[#c2c2c2] tracking-widest leading-none">
          A GRAPHIC DESIGNER
        </h2>
      </main>
    </div>
  );
}
