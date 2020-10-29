module EmailCampaigns
  module CampaignHelper

    def formatMessage key, values={}
      t("email_campaigns.#{@campaign.class.name.demodulize.underscore}.#{key}", values)
    end

    def localize multiloc
      multiloc[@locale]
    end

  end
end