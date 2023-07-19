# frozen_string_literal: true

module EmailCampaigns
  class VotingBasketNotSubmittedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('title_basket_not_submitted')
    end

    def header_message
      format_message('event_description', values: { contextTitle: localize_for_recipient(event.context_title_multiloc) })
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end
