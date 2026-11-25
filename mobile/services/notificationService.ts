import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'FitTrack AI',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#C6FF00',
    })
  }
  const existing = await Notifications.getPermissionsAsync()
  if (existing.granted) return true
  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted
}
