import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image as RNImage, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { CartesianChart, Line } from 'victory-native'
import { Camera } from 'lucide-react-native'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { colors } from '../../constants/theme'
import {
  getMeasurementHistory,
  logMeasurement,
  getProgressPhotos,
  uploadProgressPhoto,
  monthlySummary,
} from '../../services/transformationService'

export default function Progress() {
  const { user, profile } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [weightInput, setWeightInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
    if (!user) return
    Promise.all([getMeasurementHistory(user.id), getProgressPhotos(user.id)]).then(([h, p]) => {
      setHistory(h)
      setPhotos(p)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const handleLogWeight = async () => {
    if (!user || !weightInput) return
    setSaving(true)
    await logMeasurement(user.id, { weight_kg: Number(weightInput) })
    setSaving(false)
    setWeightInput('')
    load()
  }

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add a progress photo.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
    if (result.canceled || !user) return
    setUploading(true)
    const { error } = await uploadProgressPhoto(user.id, result.assets[0].uri)
    setUploading(false)
    if (error) Alert.alert('Upload failed', error.message)
    else load()
  }

  const chartData = history.filter((h) => h.weight_kg != null).map((h, i) => ({ x: i, y: h.weight_kg }))
  const summary = monthlySummary(history)
  const latestWeight = chartData.at(-1)?.y

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.lime} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Progress</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>CURRENT</Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
              {latestWeight ?? profile?.current_weight_kg ?? '—'}kg
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>GOAL</Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
              {profile?.target_weight_kg ?? '—'}kg
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>30 DAYS</Text>
            <Text style={{ color: summary && summary.change <= 0 ? colors.lime : colors.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
              {summary ? `${summary.change > 0 ? '+' : ''}${summary.change}kg` : '—'}
            </Text>
          </Card>
        </View>

        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>Weight trend</Text>
          {chartData.length < 2 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Log your weight at least twice to see a trend.</Text>
          ) : (
            <View style={{ height: 160 }}>
              <CartesianChart data={chartData} xKey="x" yKeys={['y']}>
                {({ points }) => <Line points={points.y} color={colors.lime} strokeWidth={3} curveType="natural" />}
              </CartesianChart>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <TextField placeholder="Log today's weight (kg)" keyboardType="numeric" value={weightInput} onChangeText={setWeightInput} />
            </View>
            <View style={{ width: 90 }}>
              <Button onPress={handleLogWeight} loading={saving} disabled={!weightInput}>
                Log
              </Button>
            </View>
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>Progress photos</Text>
            <Pressable onPress={handlePickPhoto} disabled={uploading}>
              {uploading ? <ActivityIndicator color={colors.lime} size="small" /> : <Camera color={colors.lime} size={18} />}
            </Pressable>
          </View>
          {photos.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No photos yet — tap the camera icon to add one. Private to you.</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {photos.map((p) => (
                <RNImage key={p.id} source={{ uri: p.url }} style={{ width: 90, height: 90, borderRadius: 12 }} />
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}
