module EmailCampaigns
  module CampaignHelper

    def formatMessage key, fragment: nil, escape_html: true, values: {}
      group = fragment || @campaign.class.name.demodulize.underscore
      # byebug if key == 'statement'
      msg = t("email_campaigns.#{group}.#{key}", values)
      if escape_html
        msg
      else
        msg.html_safe
      end
    end

    def localize multiloc
      multiloc[@locale]
    end

  end
end