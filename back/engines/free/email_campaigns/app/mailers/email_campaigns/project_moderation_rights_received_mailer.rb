module EmailCampaigns
  class ProjectModerationRightsReceivedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('title_you_became_moderator')
    end

    def header_message
      format_message('message_you_became_moderator', values: { organizationName: organization_name })
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end