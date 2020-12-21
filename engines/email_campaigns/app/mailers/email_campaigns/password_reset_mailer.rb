module EmailCampaigns
  class PasswordResetMailer < ApplicationMailer
    protected

    def subject
      I18n.t('email_campaigns.password_reset.subject', organizationName: organization_name)
    end

    def header
      false
    end
  end
end
