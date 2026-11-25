import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, Trash2 } from 'lucide-react-native'
import { useAuth } from '../../hooks/useAuth'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { Chip } from '../../components/Chip'
import { colors } from '../../constants/theme'
import { searchFoods, getTodayMeals, logMeal, deleteMealLog } from '../../services/nutritionService'
import { calculateCalorieTarget, calculateProteinTarget } from '../../utils/nutritionCalculations'

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]

function AddFoodCard({ onAdded }: { onAdded: () => void }) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [quantity, setQuantity] = useState('1')
  const [mealType, setMealType] = useState('breakfast')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) searchFoods(query).then(setResults)
      else setResults([])
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const handleAdd = async () => {
    if (!user || !selected) return
    setSaving(true)
    const qty = Number(quantity) || 1
    await logMeal(user.id, {
      foodId: selected.id,
      mealType,
      quantity: qty,
      calories: selected.calories * qty,
      protein_g: selected.protein_g * qty,
      carbs_g: selected.carbs_g * qty,
      fat_g: selected.fat_g * qty,
    })
    setSaving(false)
    setSelected(null)
    setQuery('')
    setQuantity('1')
    onAdded()
  }

  return (
    <Card>
      <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 10 }}>Add food</Text>

      {!selected ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Search color={colors.textMuted} size={16} />
            <View style={{ flex: 1 }}>
              <TextField placeholder="Search e.g. roti, dal, paneer…" value={query} onChangeText={setQuery} />
            </View>
          </View>
          {results.length > 0 && (
            <View style={{ marginTop: 8, gap: 6 }}>
              {results.map((f) => (
                <Pressable
                  key={f.id}
                  onPress={() => setSelected(f)}
                  style={{ padding: 12, borderRadius: 12, backgroundColor: colors.cardElevated }}
                >
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>{f.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                    {f.serving_size} · {f.calories} kcal · {f.protein_g}g protein
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{selected.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Servings:</Text>
            <View style={{ width: 70 }}>
              <TextField keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MEAL_TYPES.map((m) => (
              <Chip key={m.value} selected={mealType === m.value} onPress={() => setMealType(m.value)}>
                {m.label}
              </Chip>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button onPress={handleAdd} loading={saving}>
                Add to log
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="ghost" onPress={() => setSelected(null)}>
                Cancel
              </Button>
            </View>
          </View>
        </View>
      )}
    </Card>
  )
}

export default function Nutrition() {
  const { user, profile } = useAuth()
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (!user) return
    setLoading(true)
    getTodayMeals(user.id).then((data) => {
      setMeals(data)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id: string) => {
    setMeals((m) => m.filter((x) => x.id !== id))
    await deleteMealLog(id)
  }

  const totals = meals.reduce(
    (acc, m) => ({ calories: acc.calories + Number(m.calories || 0), protein_g: acc.protein_g + Number(m.protein_g || 0) }),
    { calories: 0, protein_g: 0 }
  )
  const calorieTarget = profile ? calculateCalorieTarget(profile) : null
  const proteinTarget = profile ? calculateProteinTarget(profile) : null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Meals</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{Math.round(totals.calories)}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              {calorieTarget ? `/ ${Math.round(calorieTarget)} kcal` : 'Calories'}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{Math.round(totals.protein_g)}g</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              {proteinTarget ? `/ ${Math.round(proteinTarget)}g protein` : 'Protein'}
            </Text>
          </Card>
        </View>

        <AddFoodCard onAdded={load} />

        {loading ? (
          <ActivityIndicator color={colors.lime} />
        ) : (
          MEAL_TYPES.map((type) => {
            const items = meals.filter((m) => m.meal_type === type.value)
            if (!items.length) return null
            return (
              <View key={type.value}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
                  {type.label.toUpperCase()}
                </Text>
                <View style={{ gap: 8 }}>
                  {items.map((m) => (
                    <Card key={m.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>
                          {m.foods?.name ?? m.custom_food_name ?? 'Meal'}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                          {Math.round(m.calories)} kcal · {Math.round(m.protein_g)}g protein
                        </Text>
                      </View>
                      <Pressable onPress={() => handleDelete(m.id)}>
                        <Trash2 color={colors.textMuted} size={16} />
                      </Pressable>
                    </Card>
                  ))}
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
