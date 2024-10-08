# frozen_string_literal: true

module EmailCampaigns
  class StatusChangeOnInitiativeYouFollowMailer < ApplicationMailer
    private

    def preheader
      format_message('preheader')
    end

    def subject
      format_message('subject')
    end

    def header_title
      format_message('header_title', values: { organizationName: organization_name })
    end

    def header_message
      format_message(
        'header_message',
        values: {
          initiativeTitle: localize_for_recipient(event.post_title_multiloc),
          organizationName: organization_name
        }
      )
    end
  end
end
