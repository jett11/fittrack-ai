import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { colors } from '../constants/theme'

export function AnimatedTabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const progress = useSharedValue(focused ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 220 })
  }, [focused])

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }))

  return (
    <View style={{ width: 44, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 44,
            height: 28,
            borderRadius: 14,
            backgroundColor: `${colors.lime}26`,
          },
          pillStyle,
        ]}
      />
      {children}
    </View>
  )
}
