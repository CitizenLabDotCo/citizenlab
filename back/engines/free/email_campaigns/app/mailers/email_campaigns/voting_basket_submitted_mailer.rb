# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketSubmittedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('title_basket_submitted')
    end

    def header_message
      format_message(
        'event_description',
        values: { organizationName: organization_name },
        escape_html: false
      )
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end
