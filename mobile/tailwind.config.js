// Dark-only premium palette, matching the reference design exactly.
// (The web app supports light+dark; this mobile app is dark-first only
// for v1 — all reference screenshots are dark, and doubling every screen
// for a light variant isn't justified yet.)
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './features/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#080B09',
        'bg-secondary': '#101510',
        card: '#151C17',
        'card-elevated': '#1B251E',
        lime: '#C6FF00',
        green: '#35E58B',
        emerald: '#16C784',
        'soft-green': '#B5F5C9',
        text: '#FFFFFF',
        'text-secondary': '#A0AAA3',
        'text-muted': '#707B73',
        border: 'rgba(255,255,255,0.08)',
        danger: '#FF5C5C',
      },
    },
  },
  plugins: [],
}
