# frozen_string_literal: true

module EmailCampaigns
  class ModeratorDigestMailer < ApplicationMailer
    private

    helper_method :change_ideas, :change_comments, :change_users

    def subject
      format_message('subject', values: { time: formatted_todays_date })
    end

    def header_title
      format_message('title_your_weekly_report', values: { firstName: recipient_first_name })
    end

    def header_message
      format_message('text_introduction')
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end

    def increase_from(statistic)
      return 0 if statistic.increase.zero?

      ((statistic.increase - statistic.past_increase) / statistic.increase.to_f * 100).round
    end

    def change_ideas
      @change_ideas ||= increase_from(event.statistics.activities.new_ideas)
    end

    def change_comments
      @change_comments ||= increase_from(event.statistics.activities.new_comments)
    end

    def change_users
      @change_users ||= increase_from(event.statistics.users.new_participants)
    end
  end
end
