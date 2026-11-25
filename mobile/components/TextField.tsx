import { TextInput, type TextInputProps } from 'react-native'
import { colors } from '../constants/theme'

export function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: colors.text,
        fontSize: 15,
      }}
      {...props}
    />
  )
}
