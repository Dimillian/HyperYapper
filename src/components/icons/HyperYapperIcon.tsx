interface HyperYapperIconProps {
  className?: string
  size?: number
}

export function HyperYapperIcon({ className = "", size = 32 }: HyperYapperIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Message bubble background */}
      <path
        d="M4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V18C28 20.2091 26.2091 22 24 22H12L6 26V22H8C5.79086 22 4 20.2091 4 18V8Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Lightning strike overlay */}
      <path
        d="M18 2L12 14H16L14 24L20 12H16L18 2Z"
        fill="currentColor"
        stroke="none"
      />
      
      {/* Glow effect for lightning */}
      <path
        d="M18 2L12 14H16L14 24L20 12H16L18 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        filter="url(#glow)"
      />
      
      {/* Glow filter definition */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}

export function HyperYapperFavicon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Black background */}
      <rect width="32" height="32" fill="#000000"/>
      
      {/* Message bubble background in purple */}
      <path
        d="M4 8C4 5.79086 5.79086 4 8 4H24C26.2091 4 28 5.79086 28 8V18C28 20.2091 26.2091 22 24 22H12L6 26V22H8C5.79086 22 4 20.2091 4 18V8Z"
        fill="#8B5CF6"
        fillOpacity="0.3"
        stroke="#A855F7"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Lightning strike in bright purple */}
      <path
        d="M18 2L12 14H16L14 24L20 12H16L18 2Z"
        fill="#A855F7"
      />
    </svg>
  )
}