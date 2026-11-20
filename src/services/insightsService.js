const UPPER_BODY = new Set(['Chest', 'Shoulders', 'Back', 'Arms'])
const LOWER_BODY = new Set(['Legs', 'Glutes'])

function bucketMuscleGroups(distribution) {
  let upper = 0
  let lower = 0
  let core = 0
  distribution.forEach(({ group, sets }) => {
    if (UPPER_BODY.has(group)) upper += sets
    else if (LOWER_BODY.has(group)) lower += sets
    else if (group === 'Core') core += sets
  })
  return { upper, lower, core }
}

/**
 * Builds explainable, rule-based insights from the user's own logged data.
 * Every entry states the time period it's based on and never fabricates
 * a number — categories return an empty array ("not enough data yet")
 * rather than guessing.
 */
export function buildInsights({ profile, proteinTarget, weeklyNutrition, todayMeals, workoutAnalytics, measurementHistory }) {
  return {
    nutrition: buildNutritionInsights({ proteinTarget, weeklyNutrition, todayMeals }),
    workout: buildWorkoutInsights({ workoutAnalytics }),
    progress: buildProgressInsights({ profile, measurementHistory }),
  }
}

function buildNutritionInsights({ proteinTarget, weeklyNutrition, todayMeals }) {
  const insights = []
  const loggedDays = (weeklyNutrition ?? []).filter((d) => d.calories > 0)

  if (loggedDays.length === 0) {
    return insights
  }

  if (proteinTarget) {
    const avgProtein = Math.round(loggedDays.reduce((s, d) => s + d.protein_g, 0) / loggedDays.length)
    const diff = proteinTarget - avgProtein
    insights.push({
      id: 'protein-avg',
      text:
        Math.abs(diff) <= 5
          ? `You're averaging ${avgProtein}g protein a day — right at your target.`
          : diff > 0
            ? `You're averaging ${avgProtein}g protein a day, ${diff}g below your ${proteinTarget}g target.`
            : `You're averaging ${avgProtein}g protein a day, ${Math.abs(diff)}g above your ${proteinTarget}g target.`,
      caption: `Based on ${loggedDays.length} day${loggedDays.length === 1 ? '' : 's'} logged in the last 7 days.`,
    })
  }

  if (loggedDays.length >= 4) {
    const mid = Math.floor(weeklyNutrition.length / 2)
    const earlier = weeklyNutrition.slice(0, mid).filter((d) => d.calories > 0)
    const recent = weeklyNutrition.slice(mid).filter((d) => d.calories > 0)
    if (earlier.length && recent.length) {
      const earlierAvg = earlier.reduce((s, d) => s + d.protein_g, 0) / earlier.length
      const recentAvg = recent.reduce((s, d) => s + d.protein_g, 0) / recent.length
      if (Math.abs(recentAvg - earlierAvg) >= 5) {
        insights.push({
          id: 'protein-trend',
          text: `Your protein intake has ${recentAvg > earlierAvg ? 'improved' : 'dropped'} over the last 7 days.`,
          caption: 'Comparing the first half vs. the second half of the last 7 days.',
        })
      }
    }
  }

  if (todayMeals?.length) {
    const byType = {}
    todayMeals.forEach((m) => {
      byType[m.meal_type] = (byType[m.meal_type] || 0) + Number(m.calories || 0)
    })
    const total = Object.values(byType).reduce((a, b) => a + b, 0)
    const top = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]
    if (top && total > 0) {
      const pct = Math.round((top[1] / total) * 100)
      if (pct >= 40) {
        const label = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' }[top[0]] ?? top[0]
        insights.push({
          id: 'meal-share',
          text: `${label} contributes the most to your calories today (${pct}%).`,
          caption: "Based on today's logged meals.",
        })
      }
    }
  }

  return insights
}

function buildWorkoutInsights({ workoutAnalytics }) {
  const insights = []
  if (!workoutAnalytics || workoutAnalytics.totalWorkouts === 0) return insights

  insights.push({
    id: 'weekly-frequency',
    text: `You completed ${workoutAnalytics.weeklyFrequency} workout${workoutAnalytics.weeklyFrequency === 1 ? '' : 's'} in the last 7 days.`,
    caption: 'Based on completed sessions in the last 7 days.',
  })

  const { upper, lower, core } = bucketMuscleGroups(workoutAnalytics.muscleGroupDistribution ?? [])
  const total = upper + lower + core
  if (total > 0) {
    const parts = [
      { label: 'lower-body', sets: lower },
      { label: 'upper-body', sets: upper },
    ].filter((p) => p.sets > 0 || total > 0)
    if (parts.length === 2) {
      const [a, b] = parts
      const lead = a.sets >= b.sets ? b : a
      const other = a.sets >= b.sets ? a : b
      if (other.sets > 0 && lead.sets / other.sets <= 0.5) {
        insights.push({
          id: 'muscle-balance',
          text: `Your ${lead.label} training frequency is lower than your other sessions.`,
          caption: 'Based on completed sets logged across all your sessions.',
        })
      }
    }
  }

  if (workoutAnalytics.volumeTrend && workoutAnalytics.volumeTrend.direction !== 'flat') {
    insights.push({
      id: 'volume-trend',
      text: `You have ${workoutAnalytics.volumeTrend.direction === 'up' ? 'improved' : 'reduced'} your recorded training volume recently.`,
      caption: 'Comparing your earliest vs. most recent completed sessions (weight × reps logged).',
    })
  }

  return insights
}

function buildProgressInsights({ profile, measurementHistory }) {
  const insights = []
  const weighIns = (measurementHistory ?? []).filter((h) => h.weight_kg != null)
  if (weighIns.length < 2) return insights

  const since = new Date()
  since.setDate(since.getDate() - 28)
  const recent = weighIns.filter((h) => new Date(h.measured_at) >= since)
  if (recent.length >= 2) {
    const change = Math.round((recent.at(-1).weight_kg - recent[0].weight_kg) * 10) / 10
    if (Math.abs(change) >= 0.3) {
      insights.push({
        id: 'weight-change',
        text: `Your recorded weight has changed by ${change > 0 ? '+' : ''}${change}kg over the last 4 weeks.`,
        caption: `Based on ${recent.length} measurements logged in the last 28 days.`,
      })
    }
  }

  const target = profile?.target_weight_kg
  const start = profile?.current_weight_kg
  const current = weighIns.at(-1)?.weight_kg
  if (target && start != null && current != null && target !== start) {
    const pct = Math.max(0, Math.min(100, Math.round(((current - start) / (target - start)) * 100)))
    if (pct > 0) {
      insights.push({
        id: 'goal-proximity',
        text: pct >= 100 ? "You've reached your target weight." : `You're ${pct}% of the way to your goal weight.`,
        caption: `Based on your logged weight vs. your ${target}kg target.`,
      })
    }
  }

  return insights
}
