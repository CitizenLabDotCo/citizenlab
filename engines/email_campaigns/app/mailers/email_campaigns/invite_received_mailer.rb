module EmailCampaigns
  class InviteReceivedMailer < ApplicationMailer
    protected

    def subject
      I18n.t('email_campaigns.invite_received.subject', organizationName: organization_name)
    end
  end
end
