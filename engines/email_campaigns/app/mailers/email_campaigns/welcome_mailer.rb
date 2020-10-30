module EmailCampaigns
  class WelcomeMailer < ApplicationMailer
    

    protected

    def subject
      I18n.t(
        'email_campaigns.welcome.subject', 
        organizationName: MultilocService.new.t(@tenant.settings.dig('core', 'organization_name'))
        )
    end

  end
end
