-- Analytics view for email deliveries
SELECT
    ecd.id,
    ecd.sent_at::DATE AS dimension_date_sent_id,
    ecd.campaign_id,
    p.id AS dimension_project_id,
    ecc.type NOT IN ('EmailCampaigns::Campaigns::Manual', 'EmailCampaigns::Campaigns::ManualProjectParticipants') AS automated
FROM email_campaigns_deliveries ecd
INNER JOIN email_campaigns_campaigns ecc ON ecc.id = ecd.campaign_id
LEFT JOIN projects p ON p.id = ecc.context_id;
