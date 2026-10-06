-- Reporting view: one row per event (an in-person or online meeting organised
-- within a project). Registrations for an event are attendance rows in
-- reporting_contributions, linked through parent_id.
SELECT
    e.id,
    e.project_id,
    COALESCE(
        NULLIF(e.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(e.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS title,
    e.title_multiloc,
    e.start_at,
    e.end_at,
    COALESCE(
        NULLIF(e.address_1, ''),
        NULLIF(e.location_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(e.location_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS location,
    NULLIF(e.online_link, '') AS online_link,
    NULLIF(e.using_url, '') AS external_registration_url,
    e.attendees_count,
    e.maximum_attendees,
    e.created_at
FROM events e
