import React, { useMemo } from 'react';

interface Props {
  theme: 'green' | 'blue';
  count?: number;
}

export const FireflyOverlay: React.FC<Props> = ({ theme, count = 6 }) => {
  const particles = useMemo(() => {
    // 6 Explicit Corner & Edge Regions to ensure full container spread
    const cornerRegions = [
      { minTop: 8, maxTop: 22, minLeft: 8, maxLeft: 28 },   // Top-Left Corner
      { minTop: 8, maxTop: 22, minLeft: 72, maxLeft: 92 },  // Top-Right Corner
      { minTop: 40, maxTop: 60, minLeft: 5, maxLeft: 22 },   // Center-Left Edge
      { minTop: 40, maxTop: 60, minLeft: 78, maxLeft: 95 },  // Center-Right Edge
      { minTop: 75, maxTop: 92, minLeft: 8, maxLeft: 30 },   // Bottom-Left Corner
      { minTop: 75, maxTop: 92, minLeft: 70, maxLeft: 92 },  // Bottom-Right Corner
    ];

    const arr = [];
    for (let i = 0; i < count; i++) {
      const region = cornerRegions[i % cornerRegions.length];
      const top = Math.random() * (region.maxTop - region.minTop) + region.minTop;
      const left = Math.random() * (region.maxLeft - region.minLeft) + region.minLeft;
      const size = Math.random() * 4 + 4; // 4px to 8px
      const duration = Math.random() * 6 + 7; // 7s to 13s
      const delay = Math.random() * 4; // 0s to 4s
      const dx1 = Math.round((Math.random() - 0.5) * 100);
      const dy1 = Math.round((Math.random() - 0.5) * 100);
      const dx2 = Math.round((Math.random() - 0.5) * 120);
      const dy2 = Math.round((Math.random() - 0.5) * 120);

      arr.push({ id: i, top, left, size, duration, delay, dx1, dy1, dx2, dy2 });
    }
    return arr;
  }, [count]);

  const colorClasses =
    theme === 'green'
      ? [
          'bg-emerald-400 text-emerald-400 shadow-[0_0_16px_#34d399]',
          'bg-teal-300 text-teal-300 shadow-[0_0_18px_#5eead4]',
          'bg-emerald-300 text-emerald-300 shadow-[0_0_14px_#6ee7b7]',
        ]
      : [
          'bg-cyan-400 text-cyan-400 shadow-[0_0_16px_#22d3ee]',
          'bg-sky-300 text-sky-300 shadow-[0_0_18px_#7dd3fc]',
          'bg-blue-400 text-blue-400 shadow-[0_0_14px_#60a5fa]',
        ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {particles.map((p) => {
        const colorClass = colorClasses[p.id % colorClasses.length];
        return (
          <div
            key={p.id}
            className={`firefly-particle ${colorClass}`}
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--dx1' as any]: `${p.dx1}px`,
              ['--dy1' as any]: `${p.dy1}px`,
              ['--dx2' as any]: `${p.dx2}px`,
              ['--dy2' as any]: `${p.dy2}px`,
            }}
          />
        );
      })}
    </div>
  );
};
