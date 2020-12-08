module EmailCampaigns
  class PasswordResetMailer < ApplicationMailer


    protected

    def subject
      I18n.t(
        'email_campaigns.password_reset.subject', 
        organizationName: MultilocService.new.t(@tenant.settings.dig('core', 'organization_name'))
        )
    end

  end
end