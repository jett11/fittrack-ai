// Simple, explainable progressive-overload rule: once a set hits 12+ reps,
// suggest adding weight next time; otherwise suggest adding a rep.
export function suggestProgression(lastLog) {
  if (!lastLog || lastLog.weight_kg == null || lastLog.reps_completed == null) return null

  const weight = Number(lastLog.weight_kg)
  const reps = Number(lastLog.reps_completed)
  if (!(weight > 0) || !(reps > 0)) return null

  if (reps >= 12) {
    return `Last time: ${weight}kg × ${reps} — try ${(weight + 2.5).toFixed(1)}kg`
  }
  return `Last time: ${weight}kg × ${reps} — try for ${reps + 1} reps`
}
