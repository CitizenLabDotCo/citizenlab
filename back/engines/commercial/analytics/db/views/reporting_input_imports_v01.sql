-- Reporting view: one row per imported input, with where it came from. Imports
-- stay drafts until an administrator approves them, and drafts are excluded,
-- so every row joins reporting_inputs. Leaves out content_changes and
-- extra_info, which can hold the respondent's personal data.
SELECT
    ii.id,
    ii.idea_id AS input_id,
    f.import_type AS source,
    f.parsed_value ->> 'parser' AS parser,
    ii.import_user_id AS user_id,
    ii.user_created,
    ii.locale,
    ii.approved_at,
    ii.created_at
FROM idea_imports ii
INNER JOIN ideas i ON i.id = ii.idea_id
LEFT JOIN idea_import_files f ON f.id = ii.file_id
WHERE i.publication_status IN ('submitted', 'published')
