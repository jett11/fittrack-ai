import { View } from 'react-native'
import Svg, { Polyline, Circle } from 'react-native-svg'
import { colors } from '../constants/theme'

// Expo Go can't run react-native-skia (victory-native's renderer) — it needs
// compiled native code that only ships in a custom dev build. This is a
// plain react-native-svg chart instead, which Expo Go's bundled native
// modules do support, so Progress is testable right now without a build.
export function SimpleLineChart({ data, height = 160 }: { data: number[]; height?: number }) {
  if (data.length < 2) return null

  const width = 320
  const padding = 12
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2)
      const y = padding + (1 - (v - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  const lastPoint = points.split(' ').at(-1)!.split(',').map(Number)

  return (
    <View style={{ width: '100%', height }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Polyline points={points} fill="none" stroke={colors.lime} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={lastPoint[0]} cy={lastPoint[1]} r={5} fill={colors.lime} />
      </Svg>
    </View>
  )
}
