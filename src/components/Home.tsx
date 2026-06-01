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
        <span className="text-4xl md:text-8xl font-bold opacity-80">I'm</span>
        <h1 className="text-4xl md:text-8xl font-bold mb-6 text-primary">Kavindu Shehan</h1>

        {/* Card Deck Section */}
        <CardDeck />

        {/* Subtitle / Role */}
        <h2 className="mt-10 text-6xl md:text-8xl font-black opacity-20 tracking-widest">
          A GRAPHIC DESIGNER
        </h2>
      </main>
    </div>
  );
}
