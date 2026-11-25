import { useEffect, useRef, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors } from '../constants/theme'

export function RestTimer({ seconds, onDismiss }: { seconds: number; onDismiss: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const firedRef = useRef(false)

  useEffect(() => {
    setRemaining(seconds)
    firedRef.current = false
  }, [seconds])

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1 && !firedRef.current) {
          firedRef.current = true
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }
        return Math.max(0, r - 1)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        backgroundColor: colors.cardElevated,
        borderRadius: 20,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View>
        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>REST</Text>
        <Text style={{ color: colors.lime, fontSize: 28, fontWeight: '800' }}>{remaining}s</Text>
      </View>
      <Pressable
        onPress={onDismiss}
        style={{ backgroundColor: colors.lime, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}
      >
        <Text style={{ color: colors.bg, fontWeight: '700' }}>Skip</Text>
      </Pressable>
    </View>
  )
}
