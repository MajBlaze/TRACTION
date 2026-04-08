'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type CursorVariant = 'default' | 'pointer' | 'text';

const DESKTOP_BREAKPOINT = 768;

function getCursorVariant(target: EventTarget | null): CursorVariant {
  if (!(target instanceof HTMLElement)) {
    return 'default';
  }

  if (
    target.closest(
      [
        'textarea',
        'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"])',
        '[contenteditable="true"]',
        '[data-cursor="text"]',
      ].join(', ')
    )
  ) {
    return 'text';
  }

  if (
    target.closest(
      [
        'a',
        'button',
        'label',
        'summary',
        '[role="button"]',
        'input[type="button"]',
        'input[type="submit"]',
        'input[type="reset"]',
        'input[type="checkbox"]',
        'input[type="radio"]',
        '[data-cursor="pointer"]',
        '.cursor-pointer',
      ].join(', ')
    )
  ) {
    return 'pointer';
  }

  return 'default';
}

function CursorLayer() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentPosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const syncEnabled = () => {
      setEnabled(mediaQuery.matches && window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    syncEnabled();
    mediaQuery.addEventListener('change', syncEnabled);
    window.addEventListener('resize', syncEnabled);

    return () => {
      mediaQuery.removeEventListener('change', syncEnabled);
      window.removeEventListener('resize', syncEnabled);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (enabled) {
      root.classList.add('has-custom-cursor');
    } else {
      root.classList.remove('has-custom-cursor');
    }

    return () => {
      root.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setIsDarkMode(root.classList.contains('dark'));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      setPressed(false);
      setVariant('default');
      return;
    }

    const animate = () => {
      currentPosition.current.x += (targetPosition.current.x - currentPosition.current.x) * 0.22;
      currentPosition.current.y += (targetPosition.current.y - currentPosition.current.y) * 0.22;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPosition.current.x}px, ${currentPosition.current.y}px, 0)`;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    const updateVariant = (target: EventTarget | null) => {
      setVariant(getCursorVariant(target));
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetPosition.current = { x: event.clientX, y: event.clientY };

      if (!visible) {
        currentPosition.current = { x: event.clientX, y: event.clientY };
      }

      setVisible(true);
      updateVariant(event.target);
    };

    const handlePointerOver = (event: PointerEvent) => {
      updateVariant(event.target);
      setVisible(true);
    };

    const handlePointerDown = (event: PointerEvent) => {
      setPressed(true);
      updateVariant(event.target);
    };

    const handlePointerUp = (event: PointerEvent) => {
      setPressed(false);
      updateVariant(event.target);
    };

    const handleWindowBlur = () => {
      setPressed(false);
      setVisible(false);
    };

    const handlePointerLeaveDocument = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        setVisible(false);
      }
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerover', handlePointerOver, true);
    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    document.addEventListener('pointerout', handlePointerLeaveDocument, true);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerover', handlePointerOver, true);
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      document.removeEventListener('pointerout', handlePointerLeaveDocument, true);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled, visible]);

  if (!enabled) {
    return null;
  }

  const isPointer = variant === 'pointer';
  const isText = variant === 'text';

  let width = 22;
  let height = 22;
  let scale = 1;
  let borderRadius = '9999px';
  const baseColor = isDarkMode ? '255, 255, 255' : '0, 0, 0';
  let background = `rgba(${baseColor}, 0.92)`;
  let border = `1px solid rgba(${baseColor}, 0.35)`;
  let boxShadow = `0 0 12px rgba(${baseColor}, 0.24)`;

  if (isPointer) {
    scale = pressed ? 1.45 : 2.15;
    background = pressed ? `rgba(${baseColor}, 0.58)` : `rgba(${baseColor}, 0.34)`;
    border = `1px solid rgba(${baseColor}, 0.22)`;
    boxShadow = `0 0 22px rgba(${baseColor}, 0.2)`;
  } else if (isText) {
    width = 6;
    height = 30;
    scale = pressed ? 0.9 : 1;
    background = `rgba(${baseColor}, 0.95)`;
    border = 'none';
    boxShadow = `0 0 10px rgba(${baseColor}, 0.18)`;
  } else if (pressed) {
    scale = 0.82;
    background = `rgba(${baseColor}, 1)`;
  }

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate3d(0, 0, 0)',
        transition: 'opacity 0.14s ease',
        willChange: 'transform, opacity',
      }}
    >
      <div
        className="cursorify-white"
        style={{
          width,
          height,
          marginLeft: -(width / 2),
          marginTop: -(height / 2),
          borderRadius,
          background,
          border,
          boxShadow,
          transform: `scale(${scale})`,
          transition:
            'width 0.14s ease, height 0.14s ease, border-radius 0.14s ease, background 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, transform 0.14s ease',
          willChange: 'transform, width, height',
        }}
      />
    </div>
  );
}

export function CustomCursor({ children }: { children: ReactNode }) {
  return (
    <>
      <CursorLayer />
      {children}
    </>
  );
}
