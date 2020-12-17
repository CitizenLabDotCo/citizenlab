# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailer < ApplicationMailer
    protected

    def subject
      I18n.t('email_campaigns.admin_digest.subject', organizationName: organization_name, time: Time.now)
    end

    helper_method :top_project_ideas, :change_ideas, :change_users

    private

    def top_project_ideas
      event_payload(:top_project_ideas)
    end

    def change_ideas
      activity_statistics_change_for(:new_ideas)
    end

    def change_comments
      activity_statistics_change_for(:new_comments)
    end

    def change_users
      activity_statistics_change_for(:new_users)
    end

    def activity_statistics_change_for(payload_key)
      payload = event_payload(:statistics, :activities, payload_key)
      (payload.dig(:increase) / payload.dig(:past_increase) - 1 * 100).round
    end
  end
end
