module EmailCampaigns
  class AssigneeDigestMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { numberIdeas: event.need_feedback_assigned_ideas_count })
    end

    private

    def header_title
      format_message('title_your_weekly_report', values: { firstName: recipient_first_name })
    end

    def header_message
      false
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end