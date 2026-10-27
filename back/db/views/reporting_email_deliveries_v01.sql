-- Reporting view: email deliveries as totals per campaign and day sent, never
-- per recipient. Counts must match the campaign page
-- (EmailCampaigns::Delivery.status_counts), or reports built on this view will
-- disagree with it. Like that page, each count includes the later statuses: a
-- delivery only moves forward, so one that was clicked also counts as
-- delivered and opened.
--
-- Covers email only: SMS deliveries live in their own table with other
-- statuses. Days are in the platform timezone, like the other totals views.
--
-- subject is only given for manual campaigns, where the stored subject is what
-- was sent. An automatic notification stores only an admin's customisation, if
-- any: the subject sent falls back to defaults in the translation files, with
-- placeholders filled per email.
SELECT
    c.id AS campaign_id,
    -- Campaign#campaign_name: the class name's last part, in snake case.
    lower(regexp_replace(
        regexp_replace(substring(c.type FROM '([^:]+)$'), '([A-Z]+)([A-Z][a-z])', '\1_\2', 'g'),
        '([a-z\d])([A-Z])', '\1_\2', 'g'
    )) AS campaign_type,
    c.type IN ('EmailCampaigns::Campaigns::Manual', 'EmailCampaigns::Campaigns::ManualProjectParticipants') AS manual,
    CASE WHEN c.type IN ('EmailCampaigns::Campaigns::Manual', 'EmailCampaigns::Campaigns::ManualProjectParticipants') THEN
        COALESCE(
            NULLIF(c.subject_multiloc ->> (SELECT ac.settings -> 'core' -> 'locales' ->> 0 FROM app_configurations ac LIMIT 1), ''),
            (SELECT t.value FROM jsonb_each_text(c.subject_multiloc) t WHERE t.value <> '' ORDER BY t.key LIMIT 1)
        )
    END AS subject,
    CASE c.context_type
        WHEN 'Project' THEN c.context_id
        WHEN 'Phase' THEN ph.project_id
    END AS project_id,
    ((d.sent_at AT TIME ZONE 'UTC') AT TIME ZONE COALESCE(
        (SELECT ac.settings -> 'core' ->> 'timezone' FROM app_configurations ac LIMIT 1),
        'UTC'
    ))::date AS sent_date,
    COUNT(*)::integer AS sent_count,
    COUNT(*) FILTER (WHERE d.delivery_status = 'bounced')::integer AS bounced_count,
    COUNT(*) FILTER (WHERE d.delivery_status = 'failed')::integer AS failed_count,
    COUNT(*) FILTER (WHERE d.delivery_status IN ('accepted', 'delivered', 'opened', 'clicked'))::integer AS accepted_count,
    COUNT(*) FILTER (WHERE d.delivery_status IN ('delivered', 'opened', 'clicked'))::integer AS delivered_count,
    COUNT(*) FILTER (WHERE d.delivery_status IN ('opened', 'clicked'))::integer AS opened_count,
    COUNT(*) FILTER (WHERE d.delivery_status = 'clicked')::integer AS clicked_count
FROM email_campaigns_deliveries d
INNER JOIN email_campaigns_campaigns c ON c.id = d.campaign_id
LEFT JOIN phases ph ON c.context_type = 'Phase' AND ph.id = c.context_id
GROUP BY c.id, c.type, c.subject_multiloc, c.context_type, c.context_id, ph.project_id, sent_date
