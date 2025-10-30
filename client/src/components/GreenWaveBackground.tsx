export function GreenWaveBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top wave - lighter green */}
      <svg 
        className="absolute w-full" 
        style={{ top: '45%' }}
        viewBox="0 0 1440 320" 
        preserveAspectRatio="none"
      >
        <path 
          fill="hsl(142 40% 45% / 0.95)" 
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,138.7C672,128,768,128,864,144C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      
      {/* Bottom wave - darker green */}
      <svg 
        className="absolute w-full" 
        style={{ top: '55%' }}
        viewBox="0 0 1440 320" 
        preserveAspectRatio="none"
      >
        <path 
          fill="hsl(142 50% 35%)" 
          d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,181.3C672,160,768,128,864,128C960,128,1056,160,1152,170.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
}
