type LogoProps = {
  size?: number;
  color?: string;
};

export function OwlMascot({ size = 96, color = '#3D2E5E' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-label="Caminare mascot"
    >
      {/* Body / head silhouette with pointed ears and pointed bottom */}
      <path
        d="
          M 60 18
          L 78 58
          Q 100 50 122 58
          L 140 18
          Q 152 30 158 56
          Q 188 90 184 132
          Q 180 168 156 188
          Q 140 200 124 198
          Q 110 196 100 210
          Q 90 196 76 198
          Q 60 200 44 188
          Q 20 168 16 132
          Q 12 90 42 56
          Q 48 30 60 18
          Z
        "
        fill={color}
      />

      {/* Heart-shaped face (white) */}
      <path
        d="
          M 100 82
          C 86 62 56 70 56 96
          C 56 122 80 140 100 162
          C 120 140 144 122 144 96
          C 144 70 114 62 100 82
          Z
        "
        fill="#FFFFFF"
      />

      {/* Left eye */}
      <path
        d="
          M 72 100
          Q 80 92 90 100
          Q 86 112 78 112
          Q 70 110 72 100
          Z
        "
        fill={color}
      />

      {/* Right eye */}
      <path
        d="
          M 128 100
          Q 120 92 110 100
          Q 114 112 122 112
          Q 130 110 128 100
          Z
        "
        fill={color}
      />

      {/* Beak */}
      <path
        d="
          M 100 120
          L 94 132
          Q 100 138 106 132
          Z
        "
        fill={color}
      />
    </svg>
  );
}

export function CaminareText({
  height = 48,
  color = '#3D2E5E',
}: {
  height?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: "'Fredoka', 'Satoshi', -apple-system, sans-serif",
        fontWeight: 700,
        fontSize: `${height}px`,
        color,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        display: 'inline-block',
      }}
    >
      Caminare
    </span>
  );
}
