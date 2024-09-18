# frozen_string_literal: true

module EmailCampaigns
  class InviteReceivedMailer < ApplicationMailer
    helper_method :invite_expiry_days

    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('invitation_header')
    end

    def header_message
      format_message('invitation_header_message', values: { organizationName: organization_name })
    end

    def invite_expiry_days
      Invite::EXPIRY_DAYS
    end
  end
end
