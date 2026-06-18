"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
}

function ScrollReveal({ children }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {children}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-bg-dark text-white pt-24 pb-12 px-6 relative overflow-hidden">
      {/* Editorial Grid Background overlay inside footer */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px)
          `,
          backgroundSize: "38px 38px"
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Contact CTA Section */}
        <ScrollReveal>
          <div className="flex flex-col items-center text-center mb-24">
            <span className="inline-flex w-fit items-center text-[10px] font-black uppercase tracking-[0.25em] text-primary bg-primary/10 border border-primary/20 px-4.5 py-1.5 rounded-full mb-8">
              Get In Touch
            </span>
            
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-[0.9] max-w-4xl mb-10">
              Let&apos;s build <br />
              something <span className="text-primary">great</span>.
            </h2>

            <a
              href="https://wa.me/94783765535"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-wider text-sm px-8 py-5 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              Start Collaboration
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5} 
                stroke="currentColor" 
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </ScrollReveal>

        {/* Footer Sub-Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-12 border-t border-white/10 text-sm opacity-80">
          {/* Column 1: Operating Name / Location */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <h3 className="font-black text-white text-base tracking-widest uppercase">PIXLO</h3>
            <p className="opacity-60 leading-relaxed font-light">
              Freelance Graphic Design Studio.<br />
              Based in Colombo, Sri Lanka.
            </p>
          </div>

          {/* Column 2: Contact Options */}
          <div className="md:col-span-4 flex flex-col gap-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs opacity-60">Say Hello</h4>
            <a 
              href="mailto:hello@kavindushehan.site" 
              className="hover:text-primary transition-colors w-fit font-light"
            >
              hello@kavindushehan.site
            </a>
            <a 
              href="https://wa.me/94783765535" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-primary transition-colors w-fit font-light"
            >
              +94 78 376 5535 (WhatsApp)
            </a>
          </div>

          {/* Column 3: Social Connect */}
          <div className="md:col-span-4 flex flex-col gap-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs opacity-60">Connect</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a 
                href="https://wa.me/94783765535" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors font-light"
              >
                WhatsApp
              </a>
              <a 
                href="https://www.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors font-light"
              >
                Facebook
              </a>
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors font-light"
              >
                Instagram
              </a>
              <a 
                href="https://www.tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors font-light"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 pt-8 border-t border-white/5 text-[11px] opacity-40 font-light">
          <p>© {new Date().getFullYear()} Pixlo. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed by Kavindu Shehan</p>
        </div>
      </div>
    </footer>
  );
}
