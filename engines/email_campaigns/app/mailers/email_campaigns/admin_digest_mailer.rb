# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailer < ApplicationMailer
    protected

    def subject
      I18n.t('email_campaigns.admin_digest.subject', time: Time.now)
    end

    helper_method :top_ideas, :new_initiatives, :successfull_initiatives, :published_days_diff

    private

    def header
      format_message('title_your_weekly_report', values: { firstName: recipient_first_name })
    end


    def header_message
      format_message('text_introduction')
    end

    def top_ideas
      event_payload(:top_project_ideas, :top_ideas)
    end

    def new_initiatives
      event_payload(:new_initiatives)
    end

    def successfull_initiatives
      event_payload(:succesful_initiatives)
    end

    def published_days_diff(serialized_idea)
      (Time.zone.today - serialized_idea.dig(:published_at).to_date).to_i
    end
  end
end
