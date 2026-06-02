export default function About() {
  const skills = [
    {
      title: "Social Media Design",
      desc: "Scroll-stopping posts & product graphics that grow your brand online.",
      blue: true,
      rotate: "-rotate-1",
    },
    {
      title: "Logo & Brand Identity",
      desc: "A visual identity that makes your business impossible to forget.",
      blue: false,
      rotate: "rotate-[0.8deg]",
    },
    {
      title: "Marketing Materials",
      desc: "Flyers, banners and ads designed to get you more customers.",
      blue: true,
      rotate: "-rotate-[1.5deg]",
    },
  ];

  return (
    <section className="relative w-full py-24 px-6 overflow-hidden border-t border-neutral-200/40">

      {/* Corner accent squares */}

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">

        {/* LEFT — Big editorial headline block */}
        <div className="md:col-span-6 font- flex flex-col">
          <span className="inline-flex w-fit items-center text-[11px] font-black uppercase tracking-[0.18em] text-white bg-primary px-4 py-2 rounded-full mb-8">
            Who I Am
          </span>

          <h2 className="text-6xl md:text-[5rem] font-bold leading-[0.92] tracking-tight mb-8">
            Design
            <br />
            That{" "}
            <span className="relative inline-block">
              <span className="relative z-10 px-2 text-white">Speaks.</span>
              <span className="absolute inset-0 bg-primary z-0" aria-hidden="true" />
            </span>
            <br />
            <span className="text-primary">For You.</span>
          </h2>

          <p className="text-base leading-relaxed text-black/60 mb-8 max-w-md">
            I&apos;m Shehan — a self-taught graphic designer from Colombo, Sri Lanka,
            operating under{" "}
            <img
              src="/pixlo-text-logo.svg"
              alt="Pixlo"
              className="inline-block h-[18px] align-middle mx-1"
              draggable="false"
            />
            . Started
            by watching cursor movements on downloaded Photoshop tutorials in 2020.
            Now I help local businesses look sharp and show up consistently.
          </p>

          {/* Highlight bar */}
          <div className="inline-flex w-fit items-center bg-primary/10 px-5 py-3">
            <span className="text-sm font-black text-primary uppercase tracking-widest">
              Design. Identity. Impact.
            </span>
          </div>
        </div>

        {/* RIGHT — Tag cards */}
        <div className="md:col-span-6 flex flex-col gap-6 pt-6">
          {skills.map((skill, i) => (
            <div
              key={i}
              className={`relative flex items-center gap-4 px-5 py-5 rounded-[14px] shadow-sm transition-transform duration-300 hover:rotate-0 cursor-default ${skill.rotate} ${skill.blue
                  ? "bg-primary text-white"
                  : "bg-white text-black border border-neutral-200"
                }`}
            >


              <div>
                <p
                  className={`text-[13px] font-black uppercase tracking-wide mb-1 ${skill.blue ? "text-white" : "text-primary"
                    }`}
                >
                  {skill.title}
                </p>
                <p
                  className={`text-sm leading-snug ${skill.blue ? "text-white/70" : "text-black/55"
                    }`}
                >
                  {skill.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}