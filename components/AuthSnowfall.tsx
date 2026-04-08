"use client";

const flakes = [
  { left: '3%', size: 6, delay: '0s', duration: '12s', opacity: 0.58 },
  { left: '7%', size: 9, delay: '1.6s', duration: '14s', opacity: 0.68 },
  { left: '10%', size: 10, delay: '2s', duration: '15s', opacity: 0.72 },
  { left: '14%', size: 5, delay: '3.5s', duration: '11s', opacity: 0.42 },
  { left: '16%', size: 7, delay: '5s', duration: '14s', opacity: 0.48 },
  { left: '20%', size: 12, delay: '4.3s', duration: '17s', opacity: 0.4 },
  { left: '23%', size: 9, delay: '1s', duration: '16s', opacity: 0.62 },
  { left: '27%', size: 4, delay: '6.2s', duration: '10s', opacity: 0.34 },
  { left: '31%', size: 5, delay: '7s', duration: '12s', opacity: 0.52 },
  { left: '35%', size: 15, delay: '2.8s', duration: '19s', opacity: 0.32 },
  { left: '39%', size: 11, delay: '3s', duration: '15s', opacity: 0.66 },
  { left: '43%', size: 6, delay: '8.3s', duration: '13s', opacity: 0.46 },
  { left: '47%', size: 8, delay: '6s', duration: '13s', opacity: 0.57 },
  { left: '50%', size: 13, delay: '7.2s', duration: '18s', opacity: 0.36 },
  { left: '55%', size: 6, delay: '4s', duration: '16s', opacity: 0.43 },
  { left: '59%', size: 5, delay: '9.4s', duration: '12s', opacity: 0.42 },
  { left: '62%', size: 10, delay: '0.5s', duration: '14s', opacity: 0.72 },
  { left: '66%', size: 14, delay: '1.2s', duration: '20s', opacity: 0.3 },
  { left: '70%', size: 7, delay: '8s', duration: '17s', opacity: 0.52 },
  { left: '74%', size: 4, delay: '13s', duration: '13s', opacity: 0.35 },
  { left: '78%', size: 12, delay: '2.5s', duration: '15s', opacity: 0.76 },
  { left: '82%', size: 13, delay: '5.8s', duration: '18s', opacity: 0.38 },
  { left: '86%', size: 5, delay: '9s', duration: '12s', opacity: 0.47 },
  { left: '89%', size: 6, delay: '14s', duration: '13s', opacity: 0.46 },
  { left: '93%', size: 9, delay: '1.5s', duration: '15s', opacity: 0.62 },
  { left: '96%', size: 15, delay: '4.2s', duration: '21s', opacity: 0.28 },
  { left: '6%', size: 4, delay: '5.4s', duration: '10s', opacity: 0.31 },
  { left: '12%', size: 8, delay: '2.7s', duration: '13s', opacity: 0.44 },
  { left: '18%', size: 6, delay: '9.1s', duration: '12s', opacity: 0.41 },
  { left: '25%', size: 11, delay: '0.8s', duration: '16s', opacity: 0.51 },
  { left: '33%', size: 7, delay: '4.8s', duration: '12s', opacity: 0.49 },
  { left: '41%', size: 5, delay: '10.2s', duration: '11s', opacity: 0.37 },
  { left: '49%', size: 9, delay: '3.3s', duration: '14s', opacity: 0.55 },
  { left: '57%', size: 4, delay: '11.6s', duration: '10s', opacity: 0.3 },
  { left: '64%', size: 8, delay: '6.1s', duration: '13s', opacity: 0.47 },
  { left: '72%', size: 5, delay: '1.9s', duration: '11s', opacity: 0.39 },
  { left: '80%', size: 10, delay: '7.7s', duration: '15s', opacity: 0.53 },
  { left: '88%', size: 7, delay: '12.4s', duration: '12s', opacity: 0.43 },
  { left: '98%', size: 5, delay: '5.1s', duration: '11s', opacity: 0.34 },
];

export function AuthSnowfall() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.1),transparent_24%,rgba(255,255,255,0.03))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.24),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/12 to-transparent blur-3xl" />
      <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:26px_26px]" />
      {flakes.map((flake, index) => (
        <span
          key={index}
          className="snowflake"
          style={{
            left: flake.left,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
            opacity: flake.opacity,
          }}
        />
      ))}
      {flakes.map((flake, index) => (
        <span
          key={`far-${index}`}
          className="snowflake snowflake-far"
          style={{
            left: `calc(${flake.left} + 2%)`,
            width: `${Math.max(3, flake.size - 3)}px`,
            height: `${Math.max(3, flake.size - 3)}px`,
            animationDelay: `-${index * 0.8}s`,
            animationDuration: `${parseFloat(flake.duration) + 5}s`,
            opacity: Math.max(0.18, flake.opacity - 0.22),
          }}
        />
      ))}
    </div>
  );
}
