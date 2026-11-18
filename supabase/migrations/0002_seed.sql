-- FitTrack AI — starter seed data for exercises, Indian foods and challenges.
-- Safe to re-run: guarded with "insert ... on conflict do nothing" where a
-- natural key exists, and a not-exists check elsewhere.

-- =========================================================
-- Exercises (starter set — more added in later stages)
-- =========================================================
insert into public.exercises (name, muscle_group, instructions, difficulty, default_sets, default_reps, rest_seconds, equipment, location)
select * from (values
  ('Push-up', 'Chest', 'Hands under shoulders, lower chest to the floor, push back up keeping your core tight.', 'beginner', 3, '10-15', 60, 'Bodyweight', 'both'),
  ('Bodyweight Squat', 'Legs', 'Feet shoulder-width apart, sit hips back and down, keep chest up, return to standing.', 'beginner', 3, '15-20', 60, 'Bodyweight', 'both'),
  ('Plank', 'Core', 'Forearms and toes on the floor, body in a straight line, hold without sagging hips.', 'beginner', 3, '30-45 sec', 45, 'Bodyweight', 'both'),
  ('Dumbbell Shoulder Press', 'Shoulders', 'Press dumbbells overhead from shoulder height until arms are extended, lower with control.', 'intermediate', 3, '8-12', 75, 'Dumbbells', 'gym'),
  ('Barbell Deadlift', 'Back', 'Hinge at the hips, keep the bar close to your shins, drive through your heels to stand tall.', 'advanced', 4, '5-8', 120, 'Barbell', 'gym'),
  ('Lat Pulldown', 'Back', 'Pull the bar down to your upper chest, squeezing your shoulder blades together.', 'beginner', 3, '10-12', 75, 'Cable Machine', 'gym'),
  ('Dumbbell Bicep Curl', 'Arms', 'Curl dumbbells toward your shoulders without swinging, lower slowly.', 'beginner', 3, '10-15', 60, 'Dumbbells', 'both'),
  ('Walking Lunge', 'Legs', 'Step forward into a lunge, front knee over ankle, alternate legs as you walk forward.', 'intermediate', 3, '10 per leg', 60, 'Bodyweight', 'both'),
  ('Bench Press', 'Chest', 'Lower the bar to your mid-chest, press back up to full extension.', 'intermediate', 4, '6-10', 90, 'Barbell', 'gym'),
  ('Glute Bridge', 'Glutes', 'Lie on your back, feet flat, drive hips up by squeezing your glutes.', 'beginner', 3, '15-20', 45, 'Bodyweight', 'home'),
  ('Mountain Climbers', 'Core', 'In a plank position, drive knees toward your chest alternately at a quick pace.', 'beginner', 3, '30 sec', 45, 'Bodyweight', 'home'),
  ('Pull-up', 'Back', 'Hang from a bar, pull your chin above the bar, lower under control.', 'advanced', 3, '5-10', 90, 'Pull-up Bar', 'both')
) as v(name, muscle_group, instructions, difficulty, default_sets, default_reps, rest_seconds, equipment, location)
where not exists (select 1 from public.exercises e where e.name = v.name);

-- =========================================================
-- Foods (Indian staples — calories/macros per stated serving, approximate)
-- =========================================================
insert into public.foods (name, category, calories, protein_g, carbs_g, fat_g, serving_size, is_veg)
select * from (values
  ('Roti (whole wheat)', 'Grains', 85, 3, 18, 0.5, '1 medium (30g)', true),
  ('Rice (cooked, white)', 'Grains', 130, 2.7, 28, 0.3, '100g', true),
  ('Dal (cooked, mixed lentils)', 'Legumes', 116, 9, 20, 0.4, '1 bowl (150g)', true),
  ('Egg (boiled)', 'Protein', 78, 6.3, 0.6, 5.3, '1 large', false),
  ('Paneer (raw)', 'Dairy', 265, 18, 1.2, 20, '100g', true),
  ('Curd / Dahi (plain)', 'Dairy', 98, 11, 3.4, 4.3, '1 bowl (200g)', true),
  ('Chicken Breast (cooked)', 'Protein', 165, 31, 0, 3.6, '100g', false),
  ('Fish (Rohu, cooked)', 'Protein', 97, 16.6, 0, 1.4, '100g', false),
  ('Soya Chunks (cooked)', 'Legumes', 345, 52, 33, 0.5, '100g dry', true),
  ('Chana (boiled chickpeas)', 'Legumes', 164, 8.9, 27, 2.6, '1 cup (165g)', true),
  ('Oats (cooked, plain)', 'Grains', 71, 2.5, 12, 1.5, '100g cooked', true),
  ('Poha (cooked)', 'Grains', 130, 2.5, 27, 1.5, '1 plate (150g)', true),
  ('Milk (full fat)', 'Dairy', 61, 3.2, 4.8, 3.3, '100ml', true),
  ('Banana', 'Fruit', 89, 1.1, 23, 0.3, '1 medium', true),
  ('Apple', 'Fruit', 52, 0.3, 14, 0.2, '1 medium', true),
  ('Mixed Vegetable Sabzi', 'Vegetables', 95, 2.5, 12, 4, '1 bowl (150g)', true),
  ('Peanuts (roasted)', 'Snacks', 567, 26, 16, 49, '100g', true),
  ('Almonds', 'Snacks', 579, 21, 22, 50, '100g', true)
) as v(name, category, calories, protein_g, carbs_g, fat_g, serving_size, is_veg)
where not exists (select 1 from public.foods f where f.name = v.name);

-- =========================================================
-- Challenges (safe, simple daily/weekly habits)
-- =========================================================
insert into public.challenges (title, description, category, target_value, frequency)
select * from (values
  ('Drink 8 glasses of water', 'Stay hydrated through the day.', 'water', 8, 'daily'),
  ('Complete today''s workout', 'Finish any workout session today.', 'workout', 1, 'daily'),
  ('Walk 6,000 steps', 'Get moving with a walk, errands, or a stroll.', 'steps', 6000, 'daily'),
  ('Log all your meals', 'Track breakfast, lunch and dinner today.', 'habit', 3, 'daily'),
  ('3 workouts this week', 'Complete three workout sessions by the end of the week.', 'workout', 3, 'weekly')
) as v(title, description, category, target_value, frequency)
where not exists (select 1 from public.challenges c where c.title = v.title);
