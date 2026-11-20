-- Expand the Indian food database with common breakfast/curry staples
-- requested in the nutrition redesign brief. Nutrition values are
-- approximate, standard per-serving figures (not lab-measured) —
-- consistent with the existing seed in 0002. Safe to re-run.

insert into public.foods (name, category, calories, protein_g, carbs_g, fat_g, serving_size, is_veg, price_inr)
select * from (values
  ('Idli (steamed)', 'Grains', 140, 4, 28, 0.5, '2 pieces (80g)', true, 15),
  ('Dosa (plain)', 'Grains', 133, 2.7, 23, 3.7, '1 medium (100g)', true, 20),
  ('Upma (cooked)', 'Grains', 200, 5, 30, 7, '1 bowl (150g)', true, 15),
  ('Paratha (plain)', 'Grains', 260, 5.5, 36, 10, '1 medium (60g)', true, 12),
  ('Rajma (cooked kidney beans)', 'Legumes', 215, 12, 36, 1, '1 bowl (150g)', true, 15),
  ('Chole (chickpea curry)', 'Legumes', 210, 10, 30, 6, '1 bowl (150g)', true, 18),
  ('Greek Yogurt (plain)', 'Dairy', 59, 10, 3.6, 0.4, '100g', true, 25)
) as v(name, category, calories, protein_g, carbs_g, fat_g, serving_size, is_veg, price_inr)
where not exists (select 1 from public.foods f where f.name = v.name);
