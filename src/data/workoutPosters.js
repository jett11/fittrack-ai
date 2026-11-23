// Free-license (Pexels) stock photos used as poster images for workout
// cards — gives a "video thumbnail" look without shipping real video.
const PHOTO_IDS = {
  muscle_gain: 669580,
  fat_loss: 4803921,
  general_fitness: 8032833,
  home: 7900680,
  gym: 3931367,
}
const DEFAULT_PHOTO_ID = 8032833

export function posterUrl(photoId, width = 800) {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}`
}

export function getWorkoutPosterUrl({ goal, location } = {}, width) {
  const id = PHOTO_IDS[goal] ?? PHOTO_IDS[location] ?? DEFAULT_PHOTO_ID
  return posterUrl(id, width)
}
