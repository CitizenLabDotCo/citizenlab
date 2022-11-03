-- Analytics view for email deliveries
SELECT
    ecd.id,
    ecd.sent_at::DATE AS dimension_date_sent_id,
    CASE
        WHEN ecc.type = 'EmailCampaigns::Campaigns::Manual' THEN FALSE ELSE TRUE
    END AS automated,
    CASE ecd.delivery_status
        WHEN 'sent' THEN TRUE
        WHEN 'bounced' THEN TRUE
        WHEN 'failed' THEN TRUE
        WHEN 'accepted' THEN TRUE
        WHEN 'delivered' THEN TRUE
        WHEN 'opened' THEN TRUE
        WHEN 'clicked' THEN TRUE
        ELSE FALSE
    END AS sent
from email_campaigns_deliveries ecd
INNER JOIN email_campaigns_campaigns ecc ON ecc.id = ecd.campaign_id
