# frozen_string_literal: true

module EmailCampaigns
  class InviteReminderMailer < ApplicationMailer
    helper_method :invite_expires_in_days

    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('invitation_header')
    end

    def header_message
      ''
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end

    def invite_expires_in_days(created_at)
      (created_at - Invite::EXPIRY_DAYS.days.ago).to_i / 1.day.to_i # days remaining in seconds / seconds in a day
    end
  end
end
