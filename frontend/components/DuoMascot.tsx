import React from "react";

interface DuoMascotProps {
  mood: "neutral" | "happy" | "sad";
  className?: string;
}

export default function DuoMascot({ mood, className = "w-24 h-24" }: DuoMascotProps) {
  const animationStyle = `
    @keyframes duoBounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes duoWiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-2deg); }
      75% { transform: rotate(2deg); }
    }
    @keyframes tearFall {
      0% { opacity: 1; transform: translateY(0px) scaleY(1); }
      80% { opacity: 0.8; transform: translateY(10px) scaleY(1.4); }
      100% { opacity: 0; transform: translateY(14px) scaleY(0.7); }
    }
    .duo-bounce { animation: duoBounce 1.8s ease-in-out infinite; }
    .duo-wiggle { animation: duoWiggle 3s ease-in-out infinite; transform-origin: bottom center; }
    .duo-tear-l { animation: tearFall 1.6s ease-in infinite; transform-origin: 36px 74px; }
    .duo-tear-r { animation: tearFall 1.6s ease-in infinite 0.8s; transform-origin: 84px 74px; }
  `;

  /* ─── NEUTRAL ─────────────────────────────────────────────────────────── */
  if (mood === "neutral") {
    return (
      <svg viewBox="0 0 120 120" className={`${className} duo-wiggle`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <style dangerouslySetInnerHTML={{ __html: animationStyle }} />

        {/* Shadow */}
        <ellipse cx="60" cy="114" rx="32" ry="5" fill="#000" opacity="0.12" />

        {/* Feet */}
        <rect x="36" y="99" width="15" height="11" rx="5.5" fill="#FF9600" />
        <rect x="69" y="99" width="15" height="11" rx="5.5" fill="#FF9600" />

        {/* Ears */}
        <path d="M25 46 L16 22 L38 32 Z" fill="#58A300" />
        <path d="M95 46 L104 22 L82 32 Z" fill="#58A300" />

        {/* Body */}
        <rect x="18" y="26" width="84" height="78" rx="40" fill="#78C800" />

        {/* Face lighter upper half */}
        <path d="M18 64 C18 40 36 26 60 26 C84 26 102 40 102 64 Z" fill="#92D800" />

        {/* White belly */}
        <ellipse cx="60" cy="82" rx="24" ry="20" fill="#FAFAFA" />

        {/* Chest feathers — 3 dark-green arcs stamped into the belly */}
        {/* Top arc */}
        <path d="M50 72 Q60 66 70 72" stroke="#4A9400" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Middle left arc */}
        <path d="M46 80 Q53 74 60 80" stroke="#4A9400" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Middle right arc */}
        <path d="M60 80 Q67 74 74 80" stroke="#4A9400" strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* Bottom centre arc */}
        <path d="M52 88 Q60 82 68 88" stroke="#4A9400" strokeWidth="4" strokeLinecap="round" fill="none"/>

        {/* Eyes — white circles */}
        <circle cx="42" cy="50" r="17" fill="white" />
        <circle cx="78" cy="50" r="17" fill="white" />

        {/* Pupils */}
        <circle cx="44" cy="52" r="9" fill="#2A2A2A" />
        <circle cx="76" cy="52" r="9" fill="#2A2A2A" />

        {/* Eye shines */}
        <circle cx="41" cy="48" r="3.5" fill="white" />
        <circle cx="73" cy="48" r="3.5" fill="white" />

        {/* Beak */}
        <path d="M60 68 C65 68 68 58 60 56 C52 56 55 68 60 68 Z" fill="#FF9600" />

        {/* Wings */}
        <path d="M18 56 C8 60 7 76 18 82 Z" fill="#58A300" />
        <path d="M102 56 C112 60 113 76 102 82 Z" fill="#58A300" />
      </svg>
    );
  }

  /* ─── HAPPY ───────────────────────────────────────────────────────────── */
  if (mood === "happy") {
    return (
      <svg viewBox="0 0 120 120" className={`${className} duo-bounce`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <style dangerouslySetInnerHTML={{ __html: animationStyle }} />

        {/* Fading shadow below */}
        <ellipse cx="60" cy="116" rx="26" ry="4" fill="#000" opacity="0.08" />

        {/* Feet spread wide */}
        <ellipse cx="35" cy="104" rx="11" ry="6" fill="#FF9600" transform="rotate(-25 35 104)" />
        <ellipse cx="85" cy="104" rx="11" ry="6" fill="#FF9600" transform="rotate(25 85 104)" />

        {/* Ears */}
        <path d="M23 44 L12 18 L36 28 Z" fill="#78C800" />
        <path d="M97 44 L108 18 L84 28 Z" fill="#78C800" />

        {/* Body */}
        <rect x="17" y="22" width="86" height="80" rx="40" fill="#78C800" />

        {/* Face lighter half */}
        <path d="M17 62 C17 38 36 22 60 22 C84 22 103 38 103 62 Z" fill="#92D800" />

        {/* White belly */}
        <ellipse cx="60" cy="82" rx="25" ry="20" fill="#FAFAFA" />

        {/* Chest feathers */}
        <path d="M50 72 Q60 66 70 72" stroke="#4A9400" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M46 80 Q53 74 60 80" stroke="#4A9400" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M60 80 Q67 74 74 80" stroke="#4A9400" strokeWidth="4" strokeLinecap="round" fill="none"/>

        {/* Eyes white */}
        <circle cx="42" cy="48" r="17" fill="white" />
        <circle cx="78" cy="48" r="17" fill="white" />

        {/* Happy closed curved eyes  ⌒ */}
        <path d="M31 50 C35 42 49 42 53 50" stroke="#2A2A2A" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M67 50 C71 42 85 42 89 50" stroke="#2A2A2A" strokeWidth="5" strokeLinecap="round" fill="none"/>

        {/* Open laughing beak */}
        <path d="M50 54 L70 54 C70 54 70 70 60 70 C50 70 50 54 50 54 Z" fill="#FF9600" />
        <path d="M53 57 L67 57 C66 63 63 67 60 67 C57 67 54 63 53 57 Z" fill="#CC2200" />

        {/* Wings spread out */}
        <path d="M17 50 C4 40 2 56 17 68 Z" fill="#78C800" />
        <path d="M103 50 C116 40 118 56 103 68 Z" fill="#78C800" />
      </svg>
    );
  }

  /* ─── SAD ─────────────────────────────────────────────────────────────── */
  return (
    <svg viewBox="0 0 120 120" className={`${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <style dangerouslySetInnerHTML={{ __html: animationStyle }} />

      {/* Shadow */}
      <ellipse cx="60" cy="114" rx="28" ry="5" fill="#000" opacity="0.12" />

      {/* Feet close together */}
      <rect x="40" y="100" width="14" height="10" rx="5" fill="#FF9600" />
      <rect x="66" y="100" width="14" height="10" rx="5" fill="#FF9600" />

      {/* Ears drooping */}
      <path d="M24 48 L16 24 L38 34 Z" fill="#4A8200" />
      <path d="M96 48 L104 24 L82 34 Z" fill="#4A8200" />

      {/* Body (slightly darker sad green) */}
      <rect x="20" y="28" width="80" height="76" rx="36" fill="#5A9800" />

      {/* Face lighter half */}
      <path d="M20 66 C20 44 38 28 60 28 C82 28 100 44 100 66 Z" fill="#6AB000" />

      {/* White belly */}
      <ellipse cx="60" cy="84" rx="22" ry="18" fill="#EEF7E0" />

      {/* Chest feathers */}
      <path d="M50 76 Q60 70 70 76" stroke="#3A7200" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M47 84 Q54 78 61 84" stroke="#3A7200" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M59 84 Q66 78 73 84" stroke="#3A7200" strokeWidth="4" strokeLinecap="round" fill="none"/>

      {/* Eyes white */}
      <circle cx="42" cy="52" r="16" fill="white" />
      <circle cx="78" cy="52" r="16" fill="white" />

      {/* Pupils looking down */}
      <circle cx="44" cy="56" r="8" fill="#2A2A2A" />
      <circle cx="76" cy="56" r="8" fill="#2A2A2A" />

      {/* Eye shines */}
      <circle cx="41" cy="52" r="3" fill="white" />
      <circle cx="73" cy="52" r="3" fill="white" />

      {/* Blue tear pools in eyes */}
      <path d="M28 56 Q28 68 42 68 Q56 68 56 56 Z" fill="#60AEFF" opacity="0.35" />
      <path d="M64 56 Q64 68 78 68 Q92 68 92 56 Z" fill="#60AEFF" opacity="0.35" />

      {/* Tear drops falling */}
      <g className="duo-tear-l">
        <path d="M36 70 C36 76 32 78 32 78 C32 78 28 76 28 70 C28 65 36 63 36 70 Z" fill="#3B9EFF" opacity="0.9"/>
      </g>
      <g className="duo-tear-r">
        <path d="M92 70 C92 76 88 78 88 78 C88 78 84 76 84 70 C84 65 92 63 92 70 Z" fill="#3B9EFF" opacity="0.9"/>
      </g>

      {/* Sad downward beak */}
      <path d="M60 70 C64 70 66 62 60 60 C54 60 56 70 60 70 Z" fill="#FF9600" />

      {/* Drooping wings */}
      <path d="M20 58 C12 62 11 78 20 84 Z" fill="#4A8200" />
      <path d="M100 58 C108 62 109 78 100 84 Z" fill="#4A8200" />
    </svg>
  );
}
