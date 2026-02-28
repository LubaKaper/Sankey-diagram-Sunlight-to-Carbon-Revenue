import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   PRAIRIE WOLF SOLAR LLC — SANKEY DATA
   378,728 MWh → 234,781 tons CO₂ → $4,695,620
   ══════════════════════════════════════════════════════════ */

const NODES = [
  { id: "solar", label: "Solar Generation", value: "378,728 MWh", col: 0, color: "#E8A822", subLabel: "Prairie Wolf Solar LLC" },
  { id: "displacement", label: "Grid Displacement", value: "378,728 MWh", col: 1, color: "#C47A1A", subLabel: "Fossil fuel output displaced" },
  { id: "avoided", label: "Avoided Emissions", value: "234,781 tons CO₂", col: 2, color: "#2E9E5A", subLabel: "EPA eGRID subregional rate" },
  { id: "credits", label: "Carbon Credits", value: "234,781 credits", col: 3, color: "#1A8A6E", subLabel: "Verified tradeable certificates" },
  { id: "revenue", label: "Annual Revenue", value: "$4,695,620", col: 4, color: "#0B7DDA", subLabel: "@ $20/ton voluntary market" },
];

const FLOWS = [
  { from: "solar", to: "displacement", label: "Clean MWh displaces fossil generation" },
  { from: "displacement", to: "avoided", label: "Each MWh avoids ~0.62 tons CO₂" },
  { from: "avoided", to: "credits", label: "1 ton avoided = 1 tradeable credit" },
  { from: "credits", to: "revenue", label: "Credits sold at $20/ton" },
];

const FLOW_COLORS = [
  { from: "#E8A822", to: "#C47A1A" },
  { from: "#C47A1A", to: "#2E9E5A" },
  { from: "#2E9E5A", to: "#1A8A6E" },
  { from: "#1A8A6E", to: "#0B7DDA" },
];

/* ══════════════════════════════════════════════════════════
   PARTICLES
   ══════════════════════════════════════════════════════════ */
function Particles({ pathD, color, delay = 0 }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <circle key={i} r="3" fill={color} opacity="0.7">
          <animateMotion
            dur={`${2.5 + i * 0.3}s`}
            repeatCount="indefinite"
            begin={`${delay + i * 0.4}s`}
            path={pathD}
          />
        </circle>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   FULL SCREEN SANKEY
   ══════════════════════════════════════════════════════════ */
export default function CarbonLensSankeyFull() {
  const [hoveredFlow, setHoveredFlow] = useState(-1);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [dims, setDims] = useState({ w: 1200, h: 700 });
  const containerRef = useRef(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 150); }, []);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Layout — responsive to container
  const W = dims.w;
  const H = dims.h;
  const PAD_X = W * 0.07;
  const PAD_TOP = H * 0.22;
  const NODE_W = 12;
  const NODE_H = H * 0.42;
  const COLS = 5;
  const colSpacing = (W - PAD_X * 2 - NODE_W) / (COLS - 1);

  // Node positions
  const nodePos = {};
  NODES.forEach(n => {
    nodePos[n.id] = {
      x: PAD_X + n.col * colSpacing,
      y: PAD_TOP + (H * 0.06),
      w: NODE_W,
      h: NODE_H,
    };
  });

  // Flow paths
  const flowPaths = FLOWS.map((f, i) => {
    const from = nodePos[f.from];
    const to = nodePos[f.to];
    const x1 = from.x + from.w;
    const x2 = to.x;
    const yTop1 = from.y + 12;
    const yBot1 = from.y + from.h - 12;
    const yTop2 = to.y + 12;
    const yBot2 = to.y + to.h - 12;
    const cpx = (x1 + x2) / 2;

    const dTop = `M${x1},${yTop1} C${cpx},${yTop1} ${cpx},${yTop2} ${x2},${yTop2}`;
    const dFull = `${dTop} L${x2},${yBot2} C${cpx},${yBot2} ${cpx},${yBot1} ${x1},${yBot1} Z`;

    const yCen1 = (yTop1 + yBot1) / 2;
    const yCen2 = (yTop2 + yBot2) / 2;
    const dCenter = `M${x1},${yCen1} C${cpx},${yCen1} ${cpx},${yCen2} ${x2},${yCen2}`;

    // Label position — center of the flow band
    const lx = (x1 + x2) / 2;
    const ly = (yTop1 + yBot1 + yTop2 + yBot2) / 4;

    return { ...f, dFull, dCenter, lx, ly, idx: i };
  });

  // Font sizes scaled to viewport
  const labelSize = Math.max(12, Math.min(14, W * 0.012));
  const valueSize = Math.max(18, Math.min(26, W * 0.022));
  const subSize = Math.max(10, Math.min(13, W * 0.011));
  const titleSize = Math.max(28, Math.min(44, W * 0.035));
  const subtitleSize = Math.max(14, Math.min(19, W * 0.016));

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#08090E",
        fontFamily: "'Outfit', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Atmospheric BG */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "-8%", left: "5%",
          width: "30%", height: "40%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,168,34,0.06) 0%, transparent 60%)",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", right: "2%",
          width: "28%", height: "35%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(11,125,218,0.05) 0%, transparent 60%)",
          filter: "blur(70px)",
        }} />
        <div style={{
          position: "absolute", top: "35%", left: "40%",
          width: "22%", height: "28%", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(46,158,90,0.04) 0%, transparent 60%)",
          filter: "blur(60px)",
        }} />
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.01 }}>
          <defs>
            <pattern id="gg" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#fff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gg)" />
        </svg>
      </div>

      {/* Full-screen SVG */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: loaded ? 1 : 0,
          transition: "opacity 1.2s ease 0.2s",
        }}
      >
        <defs>
          {FLOW_COLORS.map((fc, i) => (
            <linearGradient key={i} id={`fg${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={fc.from} stopOpacity="0.3" />
              <stop offset="50%" stopColor={fc.to} stopOpacity="0.2" />
              <stop offset="100%" stopColor={fc.to} stopOpacity="0.3" />
            </linearGradient>
          ))}
          {FLOW_COLORS.map((fc, i) => (
            <linearGradient key={`fh${i}`} id={`fgh${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={fc.from} stopOpacity="0.55" />
              <stop offset="50%" stopColor={fc.to} stopOpacity="0.4" />
              <stop offset="100%" stopColor={fc.to} stopOpacity="0.55" />
            </linearGradient>
          ))}
          {NODES.map(n => (
            <linearGradient key={n.id} id={`ng_${n.id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={n.color} stopOpacity="1" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.45" />
            </linearGradient>
          ))}
          <filter id="glow2">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bigGlow">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Title area */}
        <text
          x={W / 2}
          y={H * 0.065}
          textAnchor="middle"
          fill="#E8A822"
          fontSize={Math.max(10, W * 0.009)}
          fontWeight="700"
          fontFamily="'Outfit', sans-serif"
          letterSpacing="0.18em"
          style={{ textTransform: "uppercase" }}
        >
          Prairie Wolf Solar LLC — Macon County, Illinois
        </text>
        <text
          x={W / 2}
          y={H * 0.065 + titleSize * 1.2}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={titleSize}
          fontWeight="800"
          fontFamily="'Outfit', sans-serif"
          letterSpacing="-0.03em"
        >
          Follow the Money: From Sunlight to Carbon Revenue
        </text>
        <text
          x={W / 2}
          y={H * 0.065 + titleSize * 1.2 + subtitleSize * 1.6}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize={subtitleSize * 0.8}
          fontFamily="'Outfit', sans-serif"
          fontWeight="400"
        >
          Every MWh of solar displaces fossil fuel, avoids CO₂, and creates tradeable carbon value.
        </text>

        {/* Flows */}
        {flowPaths.map((fp, i) => (
          <g key={i}>
            <path
              d={fp.dFull}
              fill={hoveredFlow === i ? `url(#fgh${i})` : `url(#fg${i})`}
              stroke="none"
              style={{ transition: "fill 0.35s ease", cursor: "pointer" }}
              onMouseEnter={() => setHoveredFlow(i)}
              onMouseLeave={() => setHoveredFlow(-1)}
            />
            <path
              d={fp.dFull}
              fill="none"
              stroke={FLOW_COLORS[i].from}
              strokeWidth="0.6"
              opacity={hoveredFlow === i ? 0.45 : 0.1}
              style={{ transition: "opacity 0.35s ease" }}
            />
            <Particles pathD={fp.dCenter} color={FLOW_COLORS[i].to} delay={i * 0.7} />
          </g>
        ))}

        {/* Flow labels (only visible on hover) */}
        {flowPaths.map((fp, i) => {
          const isH = hoveredFlow === i;
          return (
            <text
              key={`fl${i}`}
              x={fp.lx}
              y={fp.ly}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize={Math.max(11, W * 0.01)}
              fontFamily="'Outfit', sans-serif"
              fontWeight="600"
              opacity={isH ? 1 : 0}
              style={{ transition: "opacity 0.3s ease", pointerEvents: "none" }}
            >
              {fp.label}
            </text>
          );
        })}

        {/* Nodes */}
        {NODES.map(n => {
          const p = nodePos[n.id];
          const isH = hoveredNode === n.id;
          const isRevenue = n.id === "revenue";
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Outer glow */}
              <rect
                x={p.x - 8}
                y={p.y}
                width={p.w + 16}
                height={p.h}
                rx={8}
                fill={n.color}
                opacity={isH ? 0.2 : 0.05}
                filter="url(#bigGlow)"
                style={{ transition: "opacity 0.3s ease" }}
              />
              {/* Node bar */}
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={6}
                fill={`url(#ng_${n.id})`}
                filter={isH ? "url(#glow2)" : undefined}
                style={{ transition: "all 0.3s ease" }}
              />
              {/* Label */}
              <text
                x={p.x + p.w / 2}
                y={p.y - valueSize - 14}
                textAnchor="middle"
                fill={n.color}
                fontSize={labelSize}
                fontWeight="700"
                fontFamily="'Outfit', sans-serif"
                letterSpacing="0.08em"
                style={{ textTransform: "uppercase" }}
              >
                {n.label}
              </text>
              {/* Value */}
              <text
                x={p.x + p.w / 2}
                y={p.y - 10}
                textAnchor="middle"
                fill={isRevenue ? "#0B7DDA" : "#fff"}
                fontSize={isRevenue ? valueSize * 1.15 : valueSize}
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
                letterSpacing="-0.02em"
                filter={isRevenue ? "url(#glow2)" : undefined}
              >
                {n.value}
              </text>
              {/* Sub label — always visible */}
              <text
                x={p.x + p.w / 2}
                y={p.y + p.h + subSize + 8}
                textAnchor="middle"
                fill={isH ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)"}
                fontSize={subSize * 0.85}
                fontFamily="'Outfit', sans-serif"
                fontWeight="400"
                style={{ transition: "fill 0.3s ease" }}
              >
                {n.subLabel}
              </text>
            </g>
          );
        })}

        {/* Bottom conversion strip */}
        {(() => {
          const stripY = H - H * 0.1;
          const steps = [
            { val: "378,728 MWh", label: "GENERATED", color: "#E8A822" },
            { val: "×  0.62 t/MWh", label: "EMISSIONS FACTOR", color: "rgba(255,255,255,0.4)" },
            { val: "234,781 tons", label: "CO₂ AVOIDED", color: "#2E9E5A" },
            { val: "×  $20/ton", label: "MARKET PRICE", color: "rgba(255,255,255,0.4)" },
            { val: "$4,695,620", label: "ANNUAL REVENUE", color: "#0B7DDA" },
          ];
          const totalSteps = steps.length;
          const stepW = (W - PAD_X * 2) / totalSteps;
          const arrowSize = Math.max(14, W * 0.014);

          return (
            <g>
              {/* Separator line */}
              <line
                x1={PAD_X}
                y1={stripY - 30}
                x2={W - PAD_X}
                y2={stripY - 30}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              {steps.map((s, i) => {
                const cx = PAD_X + i * stepW + stepW / 2;
                return (
                  <g key={i}>
                    <text
                      x={cx}
                      y={stripY}
                      textAnchor="middle"
                      fill={s.color}
                      fontSize={Math.max(14, W * 0.015)}
                      fontWeight="700"
                      fontFamily="'JetBrains Mono', monospace"
                      letterSpacing="-0.01em"
                    >
                      {s.val}
                    </text>
                    <text
                      x={cx}
                      y={stripY + Math.max(14, W * 0.012)}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.2)"
                      fontSize={Math.max(8, W * 0.007)}
                      fontWeight="600"
                      fontFamily="'Outfit', sans-serif"
                      letterSpacing="0.12em"
                    >
                      {s.label}
                    </text>
                    {i < totalSteps - 1 && i % 2 === 0 && (
                      <text
                        x={cx + stepW / 2}
                        y={stripY}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.15)"
                        fontSize={arrowSize}
                        fontWeight="300"
                      >
                        →
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* CarbonLens logo — bottom left */}
        <g>
          <rect
            x={20}
            y={H - 40}
            width={22}
            height={22}
            rx={5}
            fill="rgba(232,168,34,0.15)"
            stroke="rgba(232,168,34,0.3)"
            strokeWidth="1"
          />
          <text
            x={31}
            y={H - 24}
            textAnchor="middle"
            fill="#E8A822"
            fontSize="11"
            fontWeight="800"
            fontFamily="'JetBrains Mono', monospace"
          >
            C
          </text>
          <text
            x={52}
            y={H - 24}
            fill="rgba(255,255,255,0.4)"
            fontSize="12"
            fontWeight="600"
            fontFamily="'Outfit', sans-serif"
          >
            CarbonLens
          </text>
        </g>

        {/* Confidential — bottom right */}
        <text
          x={W - 20}
          y={H - 24}
          textAnchor="end"
          fill="rgba(255,255,255,0.15)"
          fontSize="10"
          fontFamily="'JetBrains Mono', monospace"
        >
          Confidential
        </text>
      </svg>
    </div>
  );
}
