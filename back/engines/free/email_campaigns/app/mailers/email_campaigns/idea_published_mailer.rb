# frozen_string_literal: true

module EmailCampaigns
  class IdeaPublishedMailer < ApplicationMailer
    protected

    def subject
      format_message("subject.#{event.input_term}")
    end

    private

    def header_title
      format_message('main_header', values: {
        input_title: localize_for_recipient(event.idea_title_multiloc)
      })
    end

    def preheader
      format_message('preheader', values: { firstName: recipient_first_name, organizationName: organization_name })
    end
  end
end
