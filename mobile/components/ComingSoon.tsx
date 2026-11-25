import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../constants/theme'

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{title}</Text>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>{note}</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
