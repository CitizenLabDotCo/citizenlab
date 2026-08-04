-- Reporting view: one row per (input, tag) association. Tags categorize the
-- topic of publicly visible inputs.
SELECT
    iit.id,
    iit.idea_id AS input_id,
    iit.input_topic_id AS tag_id,
    COALESCE(
        NULLIF(it.title_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
        (SELECT t.value FROM jsonb_each_text(it.title_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
    ) AS tag_label,
    it.parent_id AS parent_tag_id
FROM ideas_input_topics iit
INNER JOIN input_topics it ON it.id = iit.input_topic_id
INNER JOIN ideas i ON i.id = iit.idea_id
WHERE i.publication_status IN ('submitted', 'published')
