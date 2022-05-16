# frozen_string_literal: true

class Texting::WebhookUrlGenerator
  def mark_campaign_as_sent(campaign)
    Texting::Engine.routes.url_helpers.mark_as_sent_web_api_v1_campaign_url(
      campaign.id, host: Tenant.current.host, protocol: :https
    )
  end
end
