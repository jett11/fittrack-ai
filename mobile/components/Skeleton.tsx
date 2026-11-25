import { useEffect } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { colors } from '../constants/theme'

export function Skeleton({ width, height, borderRadius = 12, style }: { width?: number | string; height: number; borderRadius?: number; style?: any }) {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true)
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={[{ width: width ?? '100%', height, borderRadius, backgroundColor: colors.cardElevated }, animatedStyle, style]}
    />
  )
}
