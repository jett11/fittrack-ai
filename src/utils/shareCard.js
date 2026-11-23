const W = 1080
const H = 1350

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function statTile(ctx, x, y, w, h, value, label) {
  roundRect(ctx, x, y, w, h, 24)
  ctx.fillStyle = '#151c17'
  ctx.fill()

  ctx.fillStyle = '#c6ff00'
  ctx.font = '700 56px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(value, x + w / 2, y + h / 2 + 10)

  ctx.fillStyle = '#a0aaa3'
  ctx.font = '500 26px sans-serif'
  ctx.fillText(label, x + w / 2, y + h - 36)
}

/**
 * Renders a shareable "workout complete" image as a PNG blob.
 * Pure canvas drawing — no external images or fonts fetched.
 */
export function renderWorkoutShareCard({ name, durationMin, totalSets, volumeKg }) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#080b09')
  bg.addColorStop(1, '#101710')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#c6ff00'
  ctx.font = '700 36px sans-serif'
  ctx.fillText('FITTRACK AI', W / 2, 140)

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 72px sans-serif'
  ctx.fillText('Workout Complete', W / 2, 260)

  ctx.fillStyle = '#a0aaa3'
  ctx.font = '500 40px sans-serif'
  const trimmedName = name.length > 28 ? `${name.slice(0, 28)}…` : name
  ctx.fillText(trimmedName, W / 2, 320)

  const tileY = 440
  const tileW = 280
  const tileH = 280
  const gap = 40
  const totalW = tileW * 3 + gap * 2
  const startX = (W - totalW) / 2

  statTile(ctx, startX, tileY, tileW, tileH, `${durationMin}`, 'MINUTES')
  statTile(ctx, startX + tileW + gap, tileY, tileW, tileH, `${totalSets}`, 'SETS DONE')
  statTile(ctx, startX + (tileW + gap) * 2, tileY, tileW, tileH, `${volumeKg}`, 'KG LIFTED')

  ctx.fillStyle = '#ffffff'
  ctx.font = '600 32px sans-serif'
  ctx.fillText(
    new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
    W / 2,
    tileY + tileH + 90
  )

  ctx.fillStyle = '#6b7a70'
  ctx.font = '500 28px sans-serif'
  ctx.fillText('Track your own workouts free — fittrack-ai-1ip.pages.dev', W / 2, H - 80)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
