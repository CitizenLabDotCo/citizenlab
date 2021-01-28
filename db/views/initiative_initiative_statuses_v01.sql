SELECT initiative_status_changes.initiative_id, initiative_status_changes.initiative_status_id
FROM initiatives

INNER JOIN (
  SELECT initiative_id, max(initiative_status_changes.created_at) AS last_status_changed_at
  FROM initiative_status_changes
  GROUP BY initiative_status_changes.initiative_id
  ) AS initiatives_with_last_status_change
ON initiatives.id = initiatives_with_last_status_change.initiative_id

INNER JOIN initiative_status_changes
ON initiatives.id = initiative_status_changes.initiative_id
AND last_status_changed_at = initiative_status_changes.created_at

INNER JOIN initiative_statuses
ON initiative_statuses.id = initiative_status_changes.initiative_status_id
;
