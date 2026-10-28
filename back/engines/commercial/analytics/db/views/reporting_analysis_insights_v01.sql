-- Reporting view: one row per finished insight of an AI analysis: a summary
-- of a set of inputs, or a question an admin asked about them and the answer.
-- Insights still being generated, or that failed, have no text yet and are
-- left out. The prompt sent to the LLM is internal and not exposed.
SELECT
    ins.id,
    ins.analysis_id,
    -- an analysis has a project or a phase, never both
    COALESCE(a.project_id, ph.project_id) AS project_id,
    a.phase_id,
    CASE ins.insightable_type
        WHEN 'Analysis::Summary' THEN 'summary'
        WHEN 'Analysis::Question' THEN 'question'
    END AS kind,
    q.question,
    COALESCE(s.summary, q.answer) AS body,
    ins.filters,
    ins.inputs_ids AS input_ids,
    COALESCE(s.accuracy, q.accuracy) AS accuracy,
    COALESCE(s.generated_at, q.generated_at) AS generated_at,
    ins.created_at
FROM analysis_insights ins
INNER JOIN analysis_analyses a ON a.id = ins.analysis_id
LEFT JOIN phases ph ON ph.id = a.phase_id
LEFT JOIN analysis_summaries s
    ON ins.insightable_type = 'Analysis::Summary' AND s.id = ins.insightable_id
LEFT JOIN analysis_questions q
    ON ins.insightable_type = 'Analysis::Question' AND q.id = ins.insightable_id
WHERE COALESCE(s.summary, q.answer) IS NOT NULL
