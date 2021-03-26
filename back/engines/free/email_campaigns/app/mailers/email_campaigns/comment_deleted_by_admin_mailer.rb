module EmailCampaigns
  class CommentDeletedByAdminMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('main_header', values: { organizationName: organization_name })
    end

    def header_message
      format_message('event_description', values: { organizationName: organization_name })
    end

    def preheader
      format_message('preheader')
    end
  end
end