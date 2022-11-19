-- Analytics view for email deliveries
SELECT
    ecd.id,
    ecd.sent_at::DATE AS dimension_date_sent_id,
    ecd.campaign_id,
    ecc.type != 'EmailCampaigns::Campaigns::Manual' AS automated
from email_campaigns_deliveries ecd
INNER JOIN email_campaigns_campaigns ecc ON ecc.id = ecd.campaign_id
