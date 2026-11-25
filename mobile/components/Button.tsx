import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../constants/theme'

type Props = PressableProps & {
  children: string
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export function Button({ children, variant = 'primary', loading, disabled, style, onPress, ...props }: Props) {
  const isDisabled = disabled || loading

  const bg = variant === 'primary' ? colors.lime : variant === 'secondary' ? colors.card : 'transparent'
  const textColor = variant === 'primary' ? colors.bg : colors.text

  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress?.(e)
  }

  return (
    <Pressable
      disabled={isDisabled}
      onPress={handlePress}
      style={(state) => [
        {
          backgroundColor: bg,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.85 : 1,
          borderRadius: 999,
          paddingVertical: 14,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontWeight: '700', fontSize: 15 }}>{children}</Text>
      )}
    </Pressable>
  )
}
