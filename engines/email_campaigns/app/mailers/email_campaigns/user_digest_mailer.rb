module EmailCampaigns
  class UserDigestMailer < ApplicationMailer
    protected

    def subject
      I18n.t('email_campaigns.user_digest.subject', organizationName: organization_name)
    end
  end
end
