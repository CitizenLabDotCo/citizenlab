-- Reporting view: one row per input, the result of a participant filling out
-- and submitting a form: ideas, proposals, common-ground statements and survey
-- responses. Draft inputs are excluded.
SELECT
    i.id,
    COALESCE(
        NULLIF(i.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(i.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS title,
    i.created_at,
    i.submitted_at,
    i.published_at,
    i.author_id,
    i.project_id,
    i.creation_phase_id,
    -- inputs without a creation phase were posted through a transitive method,
    -- which the product resolves to ideation
    COALESCE(creation_ph.participation_method, 'ideation') AS participation_method,
    EXISTS (
        SELECT 1 FROM idea_imports ii WHERE ii.idea_id = i.id
    ) AS imported,
    (
        EXISTS (SELECT 1 FROM official_feedbacks ofb WHERE ofb.idea_id = i.id)
        OR EXISTS (
            SELECT 1 FROM activities a
            WHERE a.item_type = 'Idea' AND a.action = 'changed_status' AND a.item_id = i.id
        )
    ) AS received_feedback,
    i.likes_count,
    i.dislikes_count,
    i.comments_count,
    i.votes_count,
    COALESCE(i.manual_votes_amount, 0) AS offline_votes_count
FROM ideas i
LEFT JOIN phases creation_ph ON creation_ph.id = i.creation_phase_id
WHERE i.publication_status IN ('submitted', 'published')
