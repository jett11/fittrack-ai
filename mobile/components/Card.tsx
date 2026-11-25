import { View, type ViewProps } from 'react-native'
import { colors } from '../constants/theme'

export function Card({ style, ...props }: ViewProps) {
  return (
    <View
      style={[
        { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18 },
        style,
      ]}
      {...props}
    />
  )
}
