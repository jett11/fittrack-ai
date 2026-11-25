import { useEffect } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated'

export function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }))

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
}
