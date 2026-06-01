"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface WorkItem {
  name: string;
  type: "file" | "directory";
  coverImage: string;
  images: string[];
  description?: string;
  category?: string[];
  tools?: string[];
}

interface WorkSectionProps {
  items: WorkItem[];
}

const renderToolIcon = (tool: string) => {
  const normalized = tool.toLowerCase().trim();

  let imgName = "";
  let displayName = tool;

  if (normalized.includes("photoshop")) {
    imgName = "photoshop.png";
    displayName = "Adobe Photoshop";
  } else if (normalized.includes("after effects") || normalized === "ae") {
    imgName = "after-effects.png";
    displayName = "Adobe After Effects";
  } else if (normalized.includes("indesign") || normalized === "id") {
    imgName = "indesign.png";
    displayName = "Adobe InDesign";
  } else if (normalized.includes("figma")) {
    imgName = "figma.png";
    displayName = "Figma";
  } else if (normalized.includes("premiere") || normalized === "pr") {
    imgName = "premiere-pro.png";
    displayName = "Adobe Premiere Pro";
  }

  if (imgName) {
    return (
      <div
        key={tool}
        title={displayName}
        className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-neutral-50 border border-neutral-200/50 shadow-sm cursor-help hover:scale-105 active:scale-95 transition-all select-none"
      >
        <img
          src={`/tools-icons/${imgName}`}
          alt={displayName}
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>
    );
  }

  // Fallback for Illustrator since there is no illustrator.png in public/tools-icons
  if (normalized.includes("illustrator")) {
    return (
      <div
        key={tool}
        title="Adobe Illustrator"
        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] bg-[#331c00] border border-[#ff9a00] text-[#ff9a00] select-none shadow-sm cursor-help hover:scale-105 active:scale-95 transition-all"
      >
        Ai
      </div>
    );
  }

  return (
    <span
      key={tool}
      title={tool}
      className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200/60 rounded cursor-help hover:scale-105 active:scale-95 transition-all"
    >
      {tool}
    </span>
  );
};

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
      className={`break-inside-avoid inline-block w-full transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

export default function WorkSection({ items }: WorkSectionProps) {
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const draggedRef = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobileScreenRef = useRef(false);
  const lastScrollWidthRef = useRef(0);
  const cardLayoutsRef = useRef<{ offsetLeft: number; offsetWidth: number }[]>([]);

  // Ensure list has enough items for seamless infinite scroll loop
  const getMarqueeItems = () => {
    let list = [...items];
    while (list.length < 15) {
      list = [...list, ...items];
    }
    return [...list, ...list];
  };

  const marqueeItems = getMarqueeItems();

  const triggerCacheRebuild = () => {
    lastScrollWidthRef.current = 0; // forces rebuild in the next frame
  };

  useEffect(() => {
    const handleResize = () => {
      isMobileScreenRef.current = window.innerWidth < 640;
      triggerCacheRebuild();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [items]);

  useEffect(() => {
    setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || isMobile) return;
    const wrapperRect = e.currentTarget.getBoundingClientRect();
    const img = imageRef.current;
    if (!img) return;

    // Get unscaled image dimensions
    const imgRect = img.getBoundingClientRect();
    const imgWidth = imgRect.width / 1.8;
    const imgHeight = imgRect.height / 1.8;

    const mouseX = e.clientX - wrapperRect.left;
    const mouseY = e.clientY - wrapperRect.top;

    const wrapperCenterX = wrapperRect.width / 2;
    const wrapperCenterY = wrapperRect.height / 2;

    const dx = mouseX - wrapperCenterX;
    const dy = mouseY - wrapperCenterY;

    // Normalize offset from image center (range -1.2 to 1.2 for edge reach)
    const normX = Math.max(-1.2, Math.min(1.2, dx / (imgWidth / 2)));
    const normY = Math.max(-1.2, Math.min(1.2, dy / (imgHeight / 2)));

    // Shift image in opposite direction to follow focus point
    setPan({
      x: -normX * (imgWidth * 0.4),
      y: -normY * (imgHeight * 0.4)
    });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setPan({ x: 0, y: 0 });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isZoomed) {
      const wrapperRect = imageWrapperRef.current?.getBoundingClientRect();
      const img = imageRef.current;
      if (wrapperRect && img) {
        const imgRect = img.getBoundingClientRect();
        const imgWidth = imgRect.width; // Scale is 1.0 at click time
        const imgHeight = imgRect.height;
        const mouseX = e.clientX - wrapperRect.left;
        const mouseY = e.clientY - wrapperRect.top;
        const wrapperCenterX = wrapperRect.width / 2;
        const wrapperCenterY = wrapperRect.height / 2;
        const dx = mouseX - wrapperCenterX;
        const dy = mouseY - wrapperCenterY;
        const normX = Math.max(-1.2, Math.min(1.2, dx / (imgWidth / 2)));
        const normY = Math.max(-1.2, Math.min(1.2, dy / (imgHeight / 2)));
        setPan({
          x: -normX * (imgWidth * 0.4),
          y: -normY * (imgHeight * 0.4)
        });
      }
      setIsZoomed(true);
    } else {
      setIsZoomed(false);
      setPan({ x: 0, y: 0 });
    }
  };

  // Curved track & scroll animation calculation loop
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const container = marqueeContainerRef.current;
      const track = trackRef.current;
      if (!container || !track) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      const currentTime = now || performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Populate layout cache if scrollWidth changes
      const scrollWidth = track.scrollWidth;
      const wrappers = container.querySelectorAll(".marquee-card-wrapper");
      if (scrollWidth !== lastScrollWidthRef.current && wrappers.length > 0) {
        lastScrollWidthRef.current = scrollWidth;
        cardLayoutsRef.current = Array.from(wrappers).map((wrapper) => {
          const htmlWrapper = wrapper as HTMLElement;
          return {
            offsetLeft: htmlWrapper.offsetLeft,
            offsetWidth: htmlWrapper.offsetWidth,
          };
        });
      }

      const halfItemsCount = marqueeItems.length / 2;
      const wrapPeriod = cardLayoutsRef.current[halfItemsCount]?.offsetLeft || (scrollWidth / 2);
      if (wrapPeriod > 0) {
        // Auto-scroll when not dragging
        if (!isDraggingRef.current) {
          const speed = isMobileScreenRef.current ? 0.09 : 0.045; // px per ms
          currentXRef.current -= speed * deltaTime;
        }

        // Wrap around logic
        while (currentXRef.current < -wrapPeriod) {
          currentXRef.current += wrapPeriod;
          if (isDraggingRef.current) {
            startXRef.current -= wrapPeriod;
          }
        }
        while (currentXRef.current > 0) {
          currentXRef.current -= wrapPeriod;
          if (isDraggingRef.current) {
            startXRef.current += wrapPeriod;
          }
        }

        track.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      }

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;

      if (containerWidth > 0 && wrappers.length > 0) {
        const centerX = containerRect.left + containerWidth / 2;

        // 1. Read layout properties from cache & calculate values (no forced reflows)
        const cardData = Array.from(wrappers).map((wrapper, idx) => {
          const htmlWrapper = wrapper as HTMLElement;
          
          const layout = cardLayoutsRef.current[idx] || {
            offsetLeft: htmlWrapper.offsetLeft,
            offsetWidth: htmlWrapper.offsetWidth,
          };

          // Calculate layout center (unaffected by transforms)
          const cardLayoutCenterX = containerRect.left + currentXRef.current + layout.offsetLeft + layout.offsetWidth / 2;
          const dx = cardLayoutCenterX - centerX;

          const halfContainerWidth = containerWidth / 2;
          const d = dx / (halfContainerWidth * 1.05);
          const dClamped = Math.max(-1.3, Math.min(1.3, d));

          // Curve trajectory calculation (y-translation dome)
          const maxOffsetY = containerWidth < 640 ? 45 : 75;
          const y = Math.pow(Math.abs(dClamped), 2.0) * maxOffsetY;

          // Rotation along tangent of the curve
          const maxRotation = containerWidth < 640 ? 8 : 16;
          const rot = dClamped * maxRotation;

          // Proportional scale calculation (smooth ease-in-out curve)
          const t = Math.min(1.0, Math.abs(dClamped));
          const ease = t * t * (3 - 2 * t); // smoothstep
          const scaleFactor = 1.35 - ease * 0.75;

          const baseWidth = layout.offsetWidth;

          // Calculate exact closed-form gap compensation to maintain constant visual gaps (80px)
          const L = halfContainerWidth * 1.05;
          const x = Math.abs(dClamped);
          
          let val = 0;
          if (x <= 1.0) {
            val = 0.35 * x - 0.75 * (x * x * x - 0.5 * x * x * x * x);
          } else {
            val = -0.025 - 0.4 * (x - 1.0);
          }
          
          const multiplier = L * baseWidth / (baseWidth + 80);
          const extraX = Math.sign(dClamped) * val * multiplier;

          return {
            htmlWrapper,
            y,
            rot,
            scaleFactor,
            extraX
          };
        });

        // 2. Apply styles (grouped writes)
        cardData.forEach((card) => {
          card.htmlWrapper.style.transform = `translate3d(${card.extraX}px, ${card.y}px, 0) rotate(${card.rot}deg) scale(${card.scaleFactor})`;
        });
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX - currentXRef.current;
    draggedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const xVal = e.clientX - startXRef.current;
    if (Math.abs(xVal - currentXRef.current) > 5) {
      draggedRef.current = true;
    }
    currentXRef.current = xVal;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setTimeout(() => {
      draggedRef.current = false;
    }, 50);
  };

  // Reset index and zoom when modal opens
  useEffect(() => {
    setCurrentIndex(0);
    setIsZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [selectedItem]);

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
    setPan({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return;
      if (e.key === "Escape") setSelectedItem(null);
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? selectedItem.images.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === selectedItem.images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedItem) return;
    setCurrentIndex((prev) => (prev === 0 ? selectedItem.images.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedItem) return;
    setCurrentIndex((prev) => (prev === selectedItem.images.length - 1 ? 0 : prev + 1));
  };



  return (
    <section className="w-full py-20 md:py-32 border-t border-neutral-200/30">
      {/* Hide Scrollbars CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* FEATURED WORK (HORIZONTAL TICKER MARQUEE) */}
      <div className="w-full overflow-hidden mb-24 md:mb-32">
        <div className="max-w-6xl mx-auto text-center px-6 mb-12">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight uppercase mb-3">
            FEATURED WORK
          </h2>
          <p className="text-sm opacity-50 tracking-wider uppercase font-bold">
            Live Ticker Showcase
          </p>
        </div>

        {/* Marquee Track Container */}
        <div
          ref={marqueeContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full flex items-center overflow-hidden py-20 md:py-32 select-none cursor-grab active:cursor-grabbing touch-pan-y"
          style={{ touchAction: "pan-y" }}
        >
          {/* Glass Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#f3f3f3] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#f3f3f3] to-transparent z-10 pointer-events-none" />

          <div
            ref={trackRef}
            className="flex gap-20 flex-nowrap will-change-transform"
            style={{ width: "max-content" }}
          >
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.name}-featured-${idx}`}
                className="marquee-card-wrapper flex-shrink-0 will-change-transform"
              >
                <div
                  onClick={() => {
                    if (draggedRef.current) return;
                    setSelectedItem(item);
                  }}
                  className="marquee-card h-[150px] sm:h-[220px] rounded-3xl overflow-hidden shadow-sm border border-neutral-200/30 bg-neutral-50 cursor-pointer transition-all duration-300 hover:scale-[1.05] active:scale-95"
                >
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="h-full w-auto pointer-events-none select-none"
                    loading="lazy"
                    draggable="false"
                    onLoad={triggerCacheRebuild}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MORE WORK (MASONRY GRID) */}
      <div className="max-w-6xl mx-auto text-center px-6">
        {/* Header */}
        <h2 className="text-5xl md:text-6xl font-black tracking-tight uppercase mb-3">
          MORE WORK
        </h2>
        <p className="text-sm opacity-50 tracking-wider mb-16 uppercase font-bold">
          Take a scroll, stay a while
        </p>

        {/* Grid Container (Masonry Layout) */}
        <div className="mt-16 text-left">
          <div className="columns-2 md:columns-3 gap-6 md:gap-10 lg:gap-14 xl:gap-20 space-y-6 md:space-y-10 lg:space-y-14 xl:space-y-20">
            {items.map((item) => {
              const src = item.coverImage;
              const hasMultiple = item.type === "directory" && item.images.length > 1;

              return (
                <ScrollReveal key={item.name}>
                  <div
                    onClick={() => setSelectedItem(item)}
                    className="group relative w-full rounded-3xl bg-neutral-100 transition-transform duration-500 hover:scale-[1.03] cursor-pointer"
                  >
                    {/* Third Card (Bottom Stack Layer) */}
                    {hasMultiple && item.images[2] && (
                      <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/30 bg-neutral-50 -translate-x-[3%] -translate-y-[3%] rotate-[-4deg] z-[-2] transition-transform duration-500 group-hover:-translate-x-[6%] group-hover:-translate-y-[6%] group-hover:rotate-[-8deg] pointer-events-none">
                        <img
                          src={item.images[2]}
                          className="w-full h-full object-cover"
                          alt="stack image 3"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-white/50 z-10" />
                      </div>
                    )}

                    {/* Second Card (Middle Stack Layer) */}
                    {hasMultiple && item.images[1] && (
                      <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-sm border border-neutral-200/30 bg-neutral-50 -translate-x-[1.5%] -translate-y-[1.5%] rotate-[-2deg] z-[-1] transition-transform duration-500 group-hover:-translate-x-[3%] group-hover:-translate-y-[3%] group-hover:rotate-[-4deg] pointer-events-none">
                        <img
                          src={item.images[1]}
                          className="w-full h-full object-cover"
                          alt="stack image 2"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-white/25 z-10" />
                      </div>
                    )}

                    {/* Main Card Wrapper (Top Layer) */}
                    <div className="w-full rounded-3xl overflow-hidden shadow-sm border border-neutral-200/30 bg-neutral-50 relative z-0">
                      <img
                        src={src}
                        alt={item.name}
                        className="w-full h-auto object-contain rounded-3xl"
                        loading="lazy"
                      />
                    </div>

                    {/* Collection Indicator Badge */}
                    {item.type === "directory" && (
                      <span className="absolute bottom-3 right-3 text-[10px] font-normal uppercase tracking-wider text-white bg-primary px-2.5 py-1 rounded-full shadow-sm z-10 font-poppins">
                        {item.images.length} items
                      </span>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-100/80 backdrop-blur-xl p-4 md:p-8 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl bg-white/40 border border-neutral-200/80 rounded-[32px] overflow-hidden shadow-2xl cursor-default backdrop-blur-xl flex flex-col md:grid md:grid-cols-12 md:h-[80vh] min-h-[500px]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white hover:bg-neutral-50 text-neutral-800 rounded-full shadow-md border border-neutral-200/50 hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Left Side: Image Viewer */}
              <div className="relative col-span-8 bg-white/10 flex flex-col items-center justify-center p-6 md:p-8 border-b md:border-b-0 md:border-r border-neutral-200/40 h-[45vh] md:h-full select-none overflow-hidden">
                
                {/* Active Image Wrapper */}
                <div
                  ref={imageWrapperRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="relative w-full flex-1 flex items-center justify-center overflow-hidden z-10"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      ref={imageRef}
                      key={currentIndex}
                      src={selectedItem.images[currentIndex]}
                      alt={`${selectedItem.name} image ${currentIndex + 1}`}
                      initial={{ opacity: 0, scale: 0.97, x: 20 }}
                      animate={{
                        opacity: 1,
                        scale: isZoomed ? 1.8 : 1,
                        x: isZoomed ? pan.x : 0,
                        y: isZoomed ? pan.y : 0
                      }}
                      exit={{ opacity: 0, scale: 0.97, x: -20 }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      drag={isZoomed ? (isMobile ? true : false) : "x"}
                      dragConstraints={isZoomed ? imageWrapperRef : { left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(e, info) => {
                        if (isZoomed) return;
                        const swipeThreshold = 50;
                        if (info.offset.x < -swipeThreshold) {
                          handleNext();
                        } else if (info.offset.x > swipeThreshold) {
                          handlePrev();
                        }
                      }}
                      className={`max-w-full max-h-[35vh] md:max-h-[55vh] object-contain rounded-2xl shadow-lg pointer-events-none select-none md:pointer-events-auto active:cursor-grabbing ${
                        isZoomed ? "cursor-zoom-out z-20" : "cursor-zoom-in"
                      }`}
                      draggable="false"
                      onClick={handleImageClick}
                    />
                  </AnimatePresence>
                </div>

                {/* Desktop Left/Right Navigation Floating Arrows */}
                {selectedItem.images.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <div className="absolute left-4 w-12 h-12 pointer-events-none z-20 flex items-center justify-center mix-blend-difference">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </div>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 w-12 h-12 flex items-center justify-center bg-neutral-950/5 hover:bg-neutral-950/10 rounded-full shadow-lg border border-neutral-950/10 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                    />

                    {/* Right Arrow */}
                    <div className="absolute right-4 w-12 h-12 pointer-events-none z-20 flex items-center justify-center mix-blend-difference">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 w-12 h-12 flex items-center justify-center bg-neutral-950/5 hover:bg-neutral-950/10 rounded-full shadow-lg border border-neutral-950/10 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                    />
                  </>
                )}

                {/* Thumbnails Row (if multiple images) */}
                {selectedItem.images.length > 1 && (
                  <div className="flex gap-2.5 mt-6 max-w-full overflow-x-auto p-1 scrollbar-none snap-x z-10">
                    {selectedItem.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          currentIndex === idx ? "border-primary scale-105 shadow-md shadow-primary/20" : "border-neutral-200/60 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Details Panel */}
              <div className="col-span-4 flex flex-col p-6 md:p-8 h-[35vh] md:h-full justify-between overflow-y-auto bg-white border-t md:border-t-0 md:border-l border-neutral-200/80 z-10 font-poppins">
                <div className="flex flex-col gap-5">
                  {/* Category Tags */}
                  {selectedItem.category && selectedItem.category.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.category.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Project Title */}
                  <h3 className="text-xl md:text-2xl font-black text-neutral-800 tracking-tight uppercase leading-tight">
                    {selectedItem.name}
                  </h3>

                  {/* Divider */}
                  <div className="w-12 h-1 bg-primary rounded-full" />

                  {/* Description */}
                  {selectedItem.description && (
                    <p className="text-sm text-neutral-600 leading-relaxed font-light">
                      {selectedItem.description}
                    </p>
                  )}
                </div>

                {/* Footer details: Tools Used & Close Instruction */}
                <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col gap-4">
                  {selectedItem.tools && selectedItem.tools.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Tools Used
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedItem.tools.map((tool) => renderToolIcon(tool))}
                      </div>
                    </div>
                  )}

                  {/* Swipe / Arrow Help (if multiple images) */}
                  {selectedItem.images.length > 1 && (
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      {currentIndex + 1} of {selectedItem.images.length} • Swipe or arrow keys to browse
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
