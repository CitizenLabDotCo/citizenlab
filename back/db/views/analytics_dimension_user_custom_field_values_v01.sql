SELECT
  DISTINCT u.id as dimension_user_id,
  cf.key,
  cf.value
FROM
  users u
  LEFT JOIN LATERAL (
    SELECT
      key,
      custom_field_values ->> key AS value
    FROM
      custom_fields
    where
      custom_fields.resource_type = 'User'
  ) cf ON true
  LEFT JOIN LATERAL (
    SELECT
      jsonb_object_keys(u.custom_field_values) AS key
  ) cfv ON true;
