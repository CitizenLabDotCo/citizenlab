module EmailCampaigns
  module CampaignHelper

    def formatMessage key, fragment: nil, escape_html: true, values: {}
      group = fragment || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", values)
      if escape_html
        msg
      else
        msg.html_safe
      end
    end

    def localize multiloc
      @multiloc_service.t multiloc, @user
    end

  end
end