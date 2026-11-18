-- FitTrack AI — template workouts (user_id null, is_template true) built from
-- the exercise library seeded in 0002. Safe to re-run.

do $$
declare
  w_id uuid;
begin
  -- Home / Beginner / General fitness
  if not exists (select 1 from public.workouts where name = 'Home Starter — Full Body' and is_template) then
    insert into public.workouts (name, goal, level, location, is_template)
    values ('Home Starter — Full Body', 'general_fitness', 'beginner', 'home', true)
    returning id into w_id;

    insert into public.workout_exercises (workout_id, exercise_id, position, target_sets, target_reps, rest_seconds)
    select w_id, e.id, v.position, v.sets, v.reps, v.rest
    from (values
      ('Push-up', 1, 3, '10-15', 60),
      ('Bodyweight Squat', 2, 3, '15-20', 60),
      ('Glute Bridge', 3, 3, '15-20', 45),
      ('Plank', 4, 3, '30-45 sec', 45),
      ('Mountain Climbers', 5, 3, '30 sec', 45)
    ) as v(name, position, sets, reps, rest)
    join public.exercises e on e.name = v.name;
  end if;

  -- Home / Beginner / Fat loss
  if not exists (select 1 from public.workouts where name = 'Home Fat Loss Circuit' and is_template) then
    insert into public.workouts (name, goal, level, location, is_template)
    values ('Home Fat Loss Circuit', 'fat_loss', 'beginner', 'home', true)
    returning id into w_id;

    insert into public.workout_exercises (workout_id, exercise_id, position, target_sets, target_reps, rest_seconds)
    select w_id, e.id, v.position, v.sets, v.reps, v.rest
    from (values
      ('Mountain Climbers', 1, 4, '30 sec', 30),
      ('Bodyweight Squat', 2, 4, '20', 30),
      ('Push-up', 3, 4, '10-15', 30),
      ('Walking Lunge', 4, 3, '10 per leg', 30),
      ('Plank', 5, 3, '30-45 sec', 30)
    ) as v(name, position, sets, reps, rest)
    join public.exercises e on e.name = v.name;
  end if;

  -- Gym / Intermediate / Muscle gain — Push day
  if not exists (select 1 from public.workouts where name = 'Gym Push Day' and is_template) then
    insert into public.workouts (name, goal, level, location, is_template)
    values ('Gym Push Day', 'muscle_gain', 'intermediate', 'gym', true)
    returning id into w_id;

    insert into public.workout_exercises (workout_id, exercise_id, position, target_sets, target_reps, rest_seconds)
    select w_id, e.id, v.position, v.sets, v.reps, v.rest
    from (values
      ('Bench Press', 1, 4, '6-10', 90),
      ('Dumbbell Shoulder Press', 2, 3, '8-12', 75),
      ('Push-up', 3, 3, '10-15', 60)
    ) as v(name, position, sets, reps, rest)
    join public.exercises e on e.name = v.name;
  end if;

  -- Gym / Intermediate / Muscle gain — Pull day
  if not exists (select 1 from public.workouts where name = 'Gym Pull Day' and is_template) then
    insert into public.workouts (name, goal, level, location, is_template)
    values ('Gym Pull Day', 'muscle_gain', 'intermediate', 'gym', true)
    returning id into w_id;

    insert into public.workout_exercises (workout_id, exercise_id, position, target_sets, target_reps, rest_seconds)
    select w_id, e.id, v.position, v.sets, v.reps, v.rest
    from (values
      ('Barbell Deadlift', 1, 4, '5-8', 120),
      ('Lat Pulldown', 2, 3, '10-12', 75),
      ('Pull-up', 3, 3, '5-10', 90),
      ('Dumbbell Bicep Curl', 4, 3, '10-15', 60)
    ) as v(name, position, sets, reps, rest)
    join public.exercises e on e.name = v.name;
  end if;

  -- Gym / Intermediate / Muscle gain — Leg day
  if not exists (select 1 from public.workouts where name = 'Gym Leg Day' and is_template) then
    insert into public.workouts (name, goal, level, location, is_template)
    values ('Gym Leg Day', 'muscle_gain', 'intermediate', 'gym', true)
    returning id into w_id;

    insert into public.workout_exercises (workout_id, exercise_id, position, target_sets, target_reps, rest_seconds)
    select w_id, e.id, v.position, v.sets, v.reps, v.rest
    from (values
      ('Bodyweight Squat', 1, 4, '15-20', 60),
      ('Walking Lunge', 2, 3, '10 per leg', 60),
      ('Glute Bridge', 3, 3, '15-20', 45)
    ) as v(name, position, sets, reps, rest)
    join public.exercises e on e.name = v.name;
  end if;

  -- General fitness / advanced / gym — full body strength
  if not exists (select 1 from public.workouts where name = 'Gym Full Body Strength' and is_template) then
    insert into public.workouts (name, goal, level, location, is_template)
    values ('Gym Full Body Strength', 'general_fitness', 'advanced', 'gym', true)
    returning id into w_id;

    insert into public.workout_exercises (workout_id, exercise_id, position, target_sets, target_reps, rest_seconds)
    select w_id, e.id, v.position, v.sets, v.reps, v.rest
    from (values
      ('Barbell Deadlift', 1, 4, '5-8', 120),
      ('Bench Press', 2, 4, '6-10', 90),
      ('Pull-up', 3, 4, '5-10', 90),
      ('Bodyweight Squat', 4, 3, '15-20', 60)
    ) as v(name, position, sets, reps, rest)
    join public.exercises e on e.name = v.name;
  end if;
end $$;
