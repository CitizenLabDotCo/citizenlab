-- Reporting view: one row per report built in the platform's report builder.
-- Reports linked to a phase can be published to residents on that phase;
-- reports without a phase are internal to administrators.
SELECT
    r.id,
    r.name,
    r.phase_id,
    ph.project_id,
    r.visible,
    r.year,
    r.quarter,
    r.community_monitor,
    r.created_at,
    r.updated_at
FROM report_builder_reports r
LEFT JOIN phases ph ON ph.id = r.phase_id
