import { useState } from 'react'

export default function Poster({ src, alt = '', aspect = '16/9', overlay = true, className = '', children }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`} style={{ aspectRatio: aspect }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {overlay && <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />}
      {children && <div className="absolute inset-0">{children}</div>}
    </div>
  )
}
