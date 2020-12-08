module EmailCampaigns
  class IdeaPublishedMailer < ApplicationMailer
    protected

    def subject
      I18n.t(
        'email_campaigns.idea_published.subject',
        organizationName: MultilocService.new.t(@tenant.settings.dig('core', 'organization_name'))
      )
    end
  end
end
