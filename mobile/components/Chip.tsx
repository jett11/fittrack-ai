import { Pressable, Text } from 'react-native'
import { colors } from '../constants/theme'

export function Chip({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: selected ? colors.lime : colors.cardElevated,
      }}
    >
      <Text style={{ color: selected ? colors.bg : colors.textSecondary, fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </Pressable>
  )
}
