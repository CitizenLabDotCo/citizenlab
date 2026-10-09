-- Reporting view: one row per official feedback, the public update an
-- administrator posts on an input. Feedback on draft inputs is excluded, so
-- every row joins reporting_inputs.
SELECT
    ofb.id,
    ofb.idea_id AS input_id,
    COALESCE(
        NULLIF(ofb.body_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(ofb.body_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS body,
    COALESCE(
        NULLIF(ofb.author_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(ofb.author_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS author,
    ofb.user_id,
    ofb.created_at,
    ofb.updated_at
FROM official_feedbacks ofb
INNER JOIN ideas i ON i.id = ofb.idea_id
WHERE i.publication_status IN ('submitted', 'published')
