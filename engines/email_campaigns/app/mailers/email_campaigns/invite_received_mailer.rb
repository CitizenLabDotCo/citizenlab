module EmailCampaigns
  class InviteReceivedMailer < ApplicationMailer


    protected

    def subject
      I18n.t(
        'email_campaigns.invite_received.subject', 
        organizationName: MultilocService.new.t(@tenant.settings.dig('core', 'organization_name'))
        )
    end

  end
end