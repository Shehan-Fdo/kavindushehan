"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

const IMAGES_ARRAY = [
  "/art1.png",
  "/art2.png",
  "/art3.png",
  "/art4.png",
];

// Structural layout and speed settings for the 4 overlapping cards
const CARDS_LAYOUT = [
  { speed: 0.6, baseX: -180, baseY: 30, baseRot: -12, shadowClass: "shadow-lg" },
  { speed: 0.9, baseX: -60, baseY: -8, baseRot: -5, shadowClass: "shadow-lg" },
  { speed: 1.2, baseX: 60, baseY: 22, baseRot: 8, shadowClass: "shadow-lg" },
  { speed: 1.5, baseX: 180, baseY: 8, baseRot: 4, shadowClass: "shadow-xl" },
];

// Helper: resolve card ID from a DOM element inside the container
function getCardIdFromElement(el: EventTarget | null): number | null {
  if (!(el instanceof HTMLElement)) return null;
  const card = el.closest<HTMLElement>("[data-card-id]");
  if (!card) return null;
  const id = Number(card.dataset.cardId);
  return Number.isFinite(id) ? id : null;
}

export default function CardDeck() {
  const [cardOrder, setCardOrder] = useState<number[]>([0, 1, 2, 3]);
  const cardOrderRef = useRef<number[]>([0, 1, 2, 3]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeAnchorIndexRef = useRef<number>(0);
  const draggedCardIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Bug 1 fix: compute scaleFactor live (closure variable updated each frame)
    let scaleFactor = window.innerWidth < 640 ? 0.45 : 1;

    // Mouse target position
    let targetX = 0;
    let targetY = 0;
    let mouseVelX = 0;
    let mouseVelY = 0;
    let lastTime = performance.now();

    const STIFFNESS = 0.08;
    const DAMPING = 0.82;

    // Initialize physics state for each of the 4 persistent cards
    const cardStates = [0, 1, 2, 3].map((cardId) => {
      const el = cardsRef.current[cardId];
      const baseRot = CARDS_LAYOUT[cardId]?.baseRot || 0;
      const speed = CARDS_LAYOUT[cardId]?.speed || 1;
      return {
        cardId,
        element: el,
        baseRot,
        speed,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        rotX: 0,
        rotY: 0,
        vRotX: 0,
        vRotY: 0,
        waggle: 0,
        vWaggle: 0,
        scaleWobble: 0,
        vScaleWobble: 0,
      };
    });

    // Dynamically update element references if DOM nodes change or render
    const updateElementRefs = () => {
      cardStates.forEach((state) => {
        state.element = cardsRef.current[state.cardId];
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedCardIdRef.current !== null) return;
      const rect = container.getBoundingClientRect();
      const currentTargetX = (e.clientX - rect.left) / rect.width - 0.5;
      const currentTargetY = (e.clientY - rect.top) / rect.height - 0.5;

      const currentTime = performance.now();
      const dt = Math.max(1, currentTime - lastTime);

      const instantVelX = (currentTargetX - targetX) / dt;
      const instantVelY = (currentTargetY - targetY) / dt;

      mouseVelX = mouseVelX * 0.5 + instantVelX * 0.5 * 35;
      mouseVelY = mouseVelY * 0.5 + instantVelY * 0.5 * 35;

      const maxVel = 2.0;
      mouseVelX = Math.max(-maxVel, Math.min(maxVel, mouseVelX));
      mouseVelY = Math.max(-maxVel, Math.min(maxVel, mouseVelY));

      targetX = currentTargetX;
      targetY = currentTargetY;
      lastTime = currentTime;
    };

    const handleMouseLeave = () => {
      if (draggedCardIdRef.current !== null) return;
      targetX = 0;
      targetY = 0;
      mouseVelX = 0;
      mouseVelY = 0;
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (draggedCardIdRef.current === null) return;
      const rect = container.getBoundingClientRect();
      const currentTargetX = (e.clientX - rect.left) / rect.width - 0.5;
      const currentTargetY = (e.clientY - rect.top) / rect.height - 0.5;

      const currentTime = performance.now();
      const dt = Math.max(1, currentTime - lastTime);

      const instantVelX = (currentTargetX - targetX) / dt;
      const instantVelY = (currentTargetY - targetY) / dt;

      mouseVelX = mouseVelX * 0.5 + instantVelX * 0.5 * 35;
      mouseVelY = mouseVelY * 0.5 + instantVelY * 0.5 * 35;

      const maxVel = 2.0;
      mouseVelX = Math.max(-maxVel, Math.min(maxVel, mouseVelX));
      mouseVelY = Math.max(-maxVel, Math.min(maxVel, mouseVelY));

      targetX = currentTargetX;
      targetY = currentTargetY;
      lastTime = currentTime;
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (draggedCardIdRef.current === null) return;
      // Prevent background scrolling
      e.preventDefault();

      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const currentTargetX = (touch.clientX - rect.left) / rect.width - 0.5;
      const currentTargetY = (touch.clientY - rect.top) / rect.height - 0.5;

      const currentTime = performance.now();
      const dt = Math.max(1, currentTime - lastTime);

      const instantVelX = (currentTargetX - targetX) / dt;
      const instantVelY = (currentTargetY - targetY) / dt;

      mouseVelX = mouseVelX * 0.5 + instantVelX * 0.5 * 35;
      mouseVelY = mouseVelY * 0.5 + instantVelY * 0.5 * 35;

      const maxVel = 2.0;
      mouseVelX = Math.max(-maxVel, Math.min(maxVel, mouseVelX));
      mouseVelY = Math.max(-maxVel, Math.min(maxVel, mouseVelY));

      targetX = currentTargetX;
      targetY = currentTargetY;
      lastTime = currentTime;
    };

    // Bug 2 fix: centralized cleanup that always removes all window listeners
    const cleanupWindowListeners = () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleRelease);
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleRelease);
      window.removeEventListener("touchcancel", handleRelease);
      window.removeEventListener("pointerup", handleRelease);
      window.removeEventListener("pointercancel", handleRelease);
    };

    const handleRelease = () => {
      const releasedCardId = draggedCardIdRef.current;
      if (releasedCardId === null) return; // Bug 2 fix: guard against double-fire
      draggedCardIdRef.current = null;
      document.body.style.cursor = "";

      cleanupWindowListeners();

      const state = cardStates[releasedCardId];
      if (state) {
        const isMobile = window.innerWidth < 640;
        const bounceScale = isMobile ? 0.25 : 1.0;
        // Trigger overshoot velocities for landing snap bounce
        state.vx += mouseVelX * 8 * bounceScale;
        state.vy += mouseVelY * 8 * bounceScale;
        state.vRotX += mouseVelY * -12 * bounceScale;
        state.vRotY += mouseVelX * 12 * bounceScale;
        state.vWaggle += mouseVelX * -20 * bounceScale;
        state.scaleWobble = 0.15 * bounceScale; // Start snap scale vibration
      }

      // Reset target coordinates to center to return cards to original layout positions
      targetX = 0;
      targetY = 0;
      mouseVelX = 0;
      mouseVelY = 0;
    };

    // Bug 2 fix: force-release when tab loses focus or window blurs
    const handleVisibilityChange = () => {
      if (document.hidden && draggedCardIdRef.current !== null) {
        handleRelease();
      }
    };
    const handleWindowBlur = () => {
      if (draggedCardIdRef.current !== null) {
        handleRelease();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    // Attach mouse move listeners on container
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Bug 3 fix: delegate mouseenter to container instead of per-card listeners.
    // Uses data-card-id attribute on card elements for identification.
    const handleContainerMouseOver = (e: MouseEvent) => {
      if (draggedCardIdRef.current !== null) return;
      const cardId = getCardIdFromElement(e.target);
      if (cardId === null) return;
      const currentSlot = cardOrderRef.current.indexOf(cardId);
      if (currentSlot !== -1) {
        activeAnchorIndexRef.current = currentSlot;
      }
    };
    container.addEventListener("mouseover", handleContainerMouseOver);

    // Bug 3 fix: delegate mousedown/touchstart to container
    const handleContainerMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      const cardId = getCardIdFromElement(e.target);
      if (cardId === null) return;
      e.preventDefault();
      draggedCardIdRef.current = cardId;
      document.body.style.cursor = "grabbing";
      window.addEventListener("mousemove", handleWindowMouseMove);
      window.addEventListener("mouseup", handleRelease);
      // Bug 2 fix: add pointer-level fallback release listeners
      window.addEventListener("pointerup", handleRelease);
      window.addEventListener("pointercancel", handleRelease);
    };
    container.addEventListener("mousedown", handleContainerMouseDown);

    const handleContainerTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const cardId = getCardIdFromElement(e.target);
      if (cardId === null) return;
      draggedCardIdRef.current = cardId;
      document.body.style.cursor = "grabbing";
      window.addEventListener("touchmove", handleWindowTouchMove, { passive: false });
      window.addEventListener("touchend", handleRelease);
      window.addEventListener("touchcancel", handleRelease);
      // Bug 2 fix: pointer-level fallback
      window.addEventListener("pointerup", handleRelease);
      window.addEventListener("pointercancel", handleRelease);
    };
    container.addEventListener("touchstart", handleContainerTouchStart, { passive: true });

    // Check if the dragged card has crossed thresholds to swap slots
    const checkDragSwapping = (draggedCardId: number, currentX: number) => {
      const order = cardOrderRef.current;
      const draggedSlot = order.indexOf(draggedCardId);
      if (draggedSlot === -1) return;

      // Check swap with left slot
      if (draggedSlot > 0) {
        const leftSlot = draggedSlot - 1;
        const leftBaseX = CARDS_LAYOUT[leftSlot].baseX * scaleFactor;
        const draggedBaseX = CARDS_LAYOUT[draggedSlot].baseX * scaleFactor;

        const leftBaseY = CARDS_LAYOUT[leftSlot].baseY * scaleFactor;
        const draggedBaseY = CARDS_LAYOUT[draggedSlot].baseY * scaleFactor;

        const threshold = leftBaseX + (draggedBaseX - leftBaseX) * 0.4;
        if (currentX < threshold) {
          const neighborCardId = order[leftSlot];
          // Bug 7 fix: direct index access
          const neighborState = cardStates[neighborCardId];
          const draggedState = cardStates[draggedCardId];

          // Compensate coordinate shift to keep absolute position stable during slot transition
          if (draggedState) {
            draggedState.x += (draggedBaseX - leftBaseX);
            draggedState.y += (draggedBaseY - leftBaseY);
          }
          if (neighborState) {
            neighborState.x += (leftBaseX - draggedBaseX);
            neighborState.y += (leftBaseY - draggedBaseY);
          }

          const newOrder = [...order];
          newOrder[draggedSlot] = order[leftSlot];
          newOrder[leftSlot] = draggedCardId;
          cardOrderRef.current = newOrder;
          setCardOrder(newOrder);
          return;
        }
      }

      // Check swap with right slot
      if (draggedSlot < order.length - 1) {
        const rightSlot = draggedSlot + 1;
        const rightBaseX = CARDS_LAYOUT[rightSlot].baseX * scaleFactor;
        const draggedBaseX = CARDS_LAYOUT[draggedSlot].baseX * scaleFactor;

        const rightBaseY = CARDS_LAYOUT[rightSlot].baseY * scaleFactor;
        const draggedBaseY = CARDS_LAYOUT[draggedSlot].baseY * scaleFactor;

        const threshold = rightBaseX - (rightBaseX - draggedBaseX) * 0.4;
        if (currentX > threshold) {
          const neighborCardId = order[rightSlot];
          // Bug 7 fix: direct index access
          const neighborState = cardStates[neighborCardId];
          const draggedState = cardStates[draggedCardId];

          // Compensate coordinate shift to keep absolute position stable during slot transition
          if (draggedState) {
            draggedState.x += (draggedBaseX - rightBaseX);
            draggedState.y += (draggedBaseY - rightBaseY);
          }
          if (neighborState) {
            neighborState.x += (rightBaseX - draggedBaseX);
            neighborState.y += (rightBaseY - draggedBaseY);
          }

          const newOrder = [...order];
          newOrder[draggedSlot] = order[rightSlot];
          newOrder[rightSlot] = draggedCardId;
          cardOrderRef.current = newOrder;
          setCardOrder(newOrder);
          return;
        }
      }
    };

    let frameId: number;

    const animate = () => {
      updateElementRefs();

      // Bug 1 fix: recompute scaleFactor every frame for resize safety
      scaleFactor = window.innerWidth < 640 ? 0.45 : 1;

      mouseVelX *= 0.92;
      mouseVelY *= 0.92;

      const time = performance.now() * 0.0012; // Controls idle floating frequency
      const rect = container.getBoundingClientRect();

      // Determine which slot is the current physics anchor
      let k = activeAnchorIndexRef.current;
      if (draggedCardIdRef.current !== null) {
        const draggedSlot = cardOrderRef.current.indexOf(draggedCardIdRef.current);
        if (draggedSlot !== -1) {
          k = draggedSlot;
        }
      }

      // Solve outward from the current anchor slot index
      const updateOrder: number[] = [k];
      for (let i = k - 1; i >= 0; i--) updateOrder.push(i);
      for (let i = k + 1; i < cardStates.length; i++) updateOrder.push(i);

      updateOrder.forEach((slotIndex) => {
        const cardId = cardOrderRef.current[slotIndex];
        // Bug 7 fix: direct index access
        const state = cardStates[cardId];
        if (!state || !state.element) return;

        const baseX = CARDS_LAYOUT[slotIndex].baseX * scaleFactor;
        const baseY = CARDS_LAYOUT[slotIndex].baseY * scaleFactor;

        // Idle Float Waves (Offsets relative phase per slot index)
        const phase = slotIndex * 1.5;
        const floatY = Math.sin(time + phase) * 7;
        const floatX = Math.cos(time * 0.8 + phase) * 3;
        const floatRot = Math.sin(time * 0.6 + phase) * 1.2;

        const isDragged = draggedCardIdRef.current === state.cardId;

        // Solve Springs in a Chain structure anchored at slot k
        let destX = 0;
        let destY = 0;
        let destRotX = 0;
        let destRotY = 0;
        let destWaggle = 0;

        if (slotIndex === k) {
          if (isDragged) {
            // Dragged card follows cursor with horizontal bounds and tight vertical track
            const mouseX = targetX * rect.width;
            const mouseY = targetY * rect.height;

            const minX = CARDS_LAYOUT[0].baseX * scaleFactor - 40;
            const maxX = CARDS_LAYOUT[CARDS_LAYOUT.length - 1].baseX * scaleFactor + 40;
            const clampedAbsoluteX = Math.max(minX, Math.min(maxX, mouseX));

            destX = clampedAbsoluteX - baseX;
            destY = Math.max(-20, Math.min(20, mouseY - baseY)); // limit vertical drag to 20px
            destRotX = targetY * -15 + mouseVelY * -5;
            destRotY = targetX * 15 + mouseVelX * 5;
            destWaggle = mouseVelX * -25;
          } else {
            // Hovered anchor follows mouse coordinates with bounds
            destX = targetX * 120;
            destY = targetY * 120;
            destRotX = targetY * -30 + mouseVelY * -12;
            destRotY = targetX * 30 + mouseVelX * 12;
            destWaggle = mouseVelX * -18;
          }
        } else if (slotIndex < k) {
          // Cards to the left follow their right-neighbor (towards the anchor)
          const neighborCardId = cardOrderRef.current[slotIndex + 1];
          // Bug 7 fix: direct index access
          const neighborState = cardStates[neighborCardId];
          if (neighborState) {
            destX = neighborState.x;
            destY = neighborState.y;
            destRotX = neighborState.rotX;
            destRotY = neighborState.rotY;
            destWaggle = neighborState.waggle;
          }
        } else {
          // Cards to the right follow their left-neighbor (towards the anchor)
          const neighborCardId = cardOrderRef.current[slotIndex - 1];
          // Bug 7 fix: direct index access
          const neighborState = cardStates[neighborCardId];
          if (neighborState) {
            destX = neighborState.x;
            destY = neighborState.y;
            destRotX = neighborState.rotX;
            destRotY = neighborState.rotY;
            destWaggle = neighborState.waggle;
          }
        }

        const overshootX = (slotIndex === k ? mouseVelX * 25 : 0);
        const overshootY = (slotIndex === k ? mouseVelY * 25 : 0);

        const finalDestX = destX + overshootX;
        const finalDestY = destY + overshootY;

        const ax = (finalDestX - state.x) * STIFFNESS;
        const ay = (finalDestY - state.y) * STIFFNESS;
        state.vx = (state.vx + ax) * DAMPING;
        state.vy = (state.vy + ay) * DAMPING;
        state.x += state.vx;
        state.y += state.vy;

        const cardSize = window.innerWidth < 640 ? 90 : 200;
        const halfSize = cardSize / 2;

        // Screen viewport clamping (only while dragging)
        if (isDragged) {
          const containerCenterX = rect.left + rect.width / 2;
          const containerCenterY = rect.top + rect.height / 2;

          const cardCenterX = containerCenterX + baseX + state.x;
          const cardCenterY = containerCenterY + baseY + state.y;

          const minCardX = halfSize;
          const maxCardX = window.innerWidth - halfSize;
          const minCardY = halfSize;
          const maxCardY = window.innerHeight - halfSize;

          // Bounce velocity off viewport borders
          if (cardCenterX < minCardX || cardCenterX > maxCardX) {
            state.vx = -state.vx * 0.1;
          }
          if (cardCenterY < minCardY || cardCenterY > maxCardY) {
            state.vy = -state.vy * 0.1;
          }

          const clampedCardX = Math.max(minCardX, Math.min(maxCardX, cardCenterX));
          const clampedCardY = Math.max(minCardY, Math.min(maxCardY, cardCenterY));

          state.x = clampedCardX - containerCenterX - baseX;
          state.y = clampedCardY - containerCenterY - baseY;
        }

        const aRotX = (destRotX - state.rotX) * STIFFNESS;
        const aRotY = (destRotY - state.rotY) * STIFFNESS;
        state.vRotX = (state.vRotX + aRotX) * DAMPING;
        state.vRotY = (state.vRotY + aRotY) * DAMPING;
        state.rotX += state.vRotX;
        state.rotY += state.vRotY;

        const aWaggle = (destWaggle - state.waggle) * STIFFNESS;
        state.vWaggle = (state.vWaggle + aWaggle) * DAMPING;
        state.waggle += state.vWaggle;

        // Solve scale wobble spring
        const aScale = (0 - state.scaleWobble) * 0.15;
        state.vScaleWobble = (state.vScaleWobble + aScale) * 0.78;
        state.scaleWobble += state.vScaleWobble;

        // Swap order in real-time if dragged past thresholds
        if (isDragged) {
          checkDragSwapping(state.cardId, baseX + state.x);
        }

        // Squash & Stretch: subtle skew based on velocity
        const skewX = Math.min(8, Math.max(-8, state.vx * 0.12));
        const skewY = Math.min(8, Math.max(-8, state.vy * 0.12));

        // Swap hint indicators: adjacent cards scale down and tilt away slightly
        let neighborScale = 1.0;
        let neighborRotOffset = 0;

        if (draggedCardIdRef.current !== null && !isDragged) {
          const draggedSlot = cardOrderRef.current.indexOf(draggedCardIdRef.current);
          if (Math.abs(slotIndex - draggedSlot) === 1) {
            // Bug 7 fix: direct index access
            const draggedState = cardStates[draggedCardIdRef.current];
            if (draggedState) {
              const draggedAbsX = CARDS_LAYOUT[draggedSlot].baseX * scaleFactor + draggedState.x;
              const neighborAbsX = CARDS_LAYOUT[slotIndex].baseX * scaleFactor + state.x;
              const dist = Math.abs(draggedAbsX - neighborAbsX);
              const maxDist = 200 * scaleFactor;
              if (dist < maxDist) {
                const t = 1.0 - dist / maxDist; // 0 (far) to 1 (overlapping)
                neighborScale = 1.0 - t * 0.08;
                neighborRotOffset = (slotIndex < draggedSlot ? -1 : 1) * t * 12;
              }
            }
          }
        }

        // Apply styles directly
        const zIndex = isDragged ? 100 : 10 + slotIndex;
        state.element.style.zIndex = String(zIndex);

        const currentScale = (isDragged ? 1.06 : neighborScale) + state.scaleWobble;

        if (isDragged) {
          state.element.style.boxShadow = "0 30px 60px -15px rgb(0 0 0 / 0.35)";
          state.element.style.transform = `
            translate3d(${baseX + state.x + floatX - halfSize}px, ${baseY + state.y + floatY - halfSize}px, 60px)
            rotateX(${state.rotX}deg)
            rotateY(${state.rotY}deg)
            rotateZ(${CARDS_LAYOUT[slotIndex].baseRot + state.waggle + floatRot}deg)
            scale(${currentScale})
            skewX(${skewX}deg)
            skewY(${skewY}deg)
          `;
        } else {
          state.element.style.boxShadow = "";
          state.element.style.transform = `
            translate3d(${baseX + state.x + floatX - halfSize}px, ${baseY + state.y + floatY - halfSize}px, 0px)
            rotateX(${state.rotX}deg)
            rotateY(${state.rotY}deg)
            rotateZ(${CARDS_LAYOUT[slotIndex].baseRot + neighborRotOffset + state.waggle + floatRot}deg)
            scale(${currentScale})
            skewX(${skewX}deg)
            skewY(${skewY}deg)
          `;
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseover", handleContainerMouseOver);
      container.removeEventListener("mousedown", handleContainerMouseDown);
      container.removeEventListener("touchstart", handleContainerTouchStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      cleanupWindowListeners();
      cancelAnimationFrame(frameId);
    };
  }, []); // Run once on mount to keep physics context stable

  // Compute initial transform so cards render spread out before useEffect animation kicks in.
  // This prevents the "stacked cards" flash on slow hydration or HMR reconnects.
  const getInitialTransform = useCallback((slotIndex: number) => {
    // We can't know viewport width at SSR, so we use CSS clamp-like approach:
    // Provide the desktop transform as default; the useEffect will immediately
    // correct to mobile values if needed on first frame.
    const layout = CARDS_LAYOUT[slotIndex];
    const halfSize = 100; // desktop: 200/2
    const bx = layout.baseX - halfSize;
    const by = layout.baseY - halfSize;
    return `translate3d(${bx}px, ${by}px, 0px) rotateZ(${layout.baseRot}deg)`;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl h-[130px] sm:h-[280px] flex items-center justify-center cursor-default select-none touch-none"
      style={{ perspective: "1200px" }}
    >
      {cardOrder.map((cardId) => {
        const slotIndex = cardOrder.indexOf(cardId);
        const layout = CARDS_LAYOUT[slotIndex];

        return (
          <div
            key={cardId}
            ref={(el) => { cardsRef.current[cardId] = el; }}
            data-card-id={cardId}
            data-speed={layout.speed}
            data-base-x={layout.baseX}
            data-base-y={layout.baseY}
            data-base-rot={layout.baseRot}
            className={`absolute w-[90px] h-[90px] sm:w-[200px] sm:h-[200px] rounded-3xl overflow-hidden bg-neutral-100 will-change-transform cursor-grab active:cursor-grabbing ${layout.shadowClass}`}
            style={{
              transformStyle: "preserve-3d",
              transition: "box-shadow 0.3s ease",
              left: "50%",
              top: "50%",
              transform: getInitialTransform(slotIndex),
              zIndex: 10 + slotIndex,
            }}
          >
            {IMAGES_ARRAY[cardId] ? (
              <img
                src={IMAGES_ARRAY[cardId]}
                alt={`Card Visual ${cardId + 1}`}
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable="false"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400 text-xs">
                No Image
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
