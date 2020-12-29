module EmailCampaigns
  module CampaignHelper
    def format_message(key, component: nil, escape_html: true, values: {})
      group = component || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", values)
      if escape_html
        msg
      else
        msg.html_safe
      end
    end
  end
end
