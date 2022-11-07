-- Analytics view for email deliveries
SELECT
    ecd.id,
    ecd.sent_at::DATE AS dimension_date_sent_id,
    CASE ecc.type
        WHEN 'EmailCampaigns::Campaigns::Manual' THEN FALSE
        ELSE TRUE
    END AS automated,
    CASE
        WHEN (
            ecd.delivery_status = 'sent' OR
            ecd.delivery_status = 'bounced' OR
            ecd.delivery_status = 'failed' OR
            ecd.delivery_status = 'accepted' OR
            ecd.delivery_status = 'delivered' OR
            ecd.delivery_status = 'opened' OR
            ecd.delivery_status = 'clicked'
        ) THEN TRUE
        ELSE FALSE
    END AS sent
from email_campaigns_deliveries ecd
INNER JOIN email_campaigns_campaigns ecc ON ecc.id = ecd.campaign_id
