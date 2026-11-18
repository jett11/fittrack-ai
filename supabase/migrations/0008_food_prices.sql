-- Approximate per-serving price in INR, for the budget meal planner.
-- Rough everyday-market estimates, not live pricing. Safe to re-run.

alter table public.foods add column if not exists price_inr numeric;

update public.foods set price_inr = v.price
from (values
  ('Roti (whole wheat)', 3),
  ('Rice (cooked, white)', 4),
  ('Dal (cooked, mixed lentils)', 8),
  ('Egg (boiled)', 7),
  ('Paneer (raw)', 35),
  ('Curd / Dahi (plain)', 12),
  ('Chicken Breast (cooked)', 25),
  ('Fish (Rohu, cooked)', 20),
  ('Soya Chunks (cooked)', 15),
  ('Chana (boiled chickpeas)', 10),
  ('Oats (cooked, plain)', 8),
  ('Poha (cooked)', 10),
  ('Milk (full fat)', 6),
  ('Banana', 5),
  ('Apple', 15),
  ('Mixed Vegetable Sabzi', 15),
  ('Peanuts (roasted)', 12),
  ('Almonds', 80)
) as v(name, price)
where public.foods.name = v.name;
