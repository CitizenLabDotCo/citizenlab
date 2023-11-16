SELECT
  users.id as user_id,
  custom_field_values.key,
  custom_field_values.value
FROM
  users
  JOIN jsonb_each_text(users.custom_field_values) custom_field_values ON true;
