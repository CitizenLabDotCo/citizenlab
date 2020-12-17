module EmailCampaigns
  class WelcomeMailer < ApplicationMailer
    protected

    def subject
      I18n.t('email_campaigns.welcome.subject', organizationName: organization_name)
    end
  end
end
