const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product'

/**
 * Free, no-key lookup via Open Food Facts. Returns per-100g nutrition
 * (OFF's standard basis) shaped like a `foods` row so it can flow through
 * the same quantity-multiplier math as the local food database.
 */
export async function lookupBarcode(code) {
  try {
    const res = await fetch(`${OFF_BASE}/${encodeURIComponent(code)}.json?fields=product_name,nutriments`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null

    const n = data.product.nutriments ?? {}
    const calories = n['energy-kcal_100g']
    if (calories == null) return null

    return {
      name: data.product.product_name || `Product ${code}`,
      calories: Math.round(calories),
      protein_g: Math.round(n.proteins_100g ?? 0),
      carbs_g: Math.round(n.carbohydrates_100g ?? 0),
      fat_g: Math.round(n.fat_100g ?? 0),
      serving_size: '100g',
    }
  } catch {
    return null
  }
}
