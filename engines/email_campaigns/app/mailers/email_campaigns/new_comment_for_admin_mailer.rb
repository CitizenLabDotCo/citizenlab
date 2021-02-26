module EmailCampaigns
  class NewCommentForAdminMailer < ApplicationMailer
    protected

    helper_method :time_ago

    def subject
      format_message('subject', values: {organizationName: organization_name})
    end

    def header_title
      format_message('main_header', values: {firstName: recipient.first_name})
    end

    def header_message
      format_message('event_description', values: {
        authorName: event.comment_author_name,
      })
    end

    def preheader
      format_message('preheader', values: {
        organizationName: organization_name,
        authorName: event.initiating_user_first_name
      })
    end

    def time_ago d
      diff_days = ((Time.now - Time.parse(d)) / 1.day)
      if diff_days < 1
        format_message('today')
      elsif diff_days < 2
        format_message('yesterday')
      else
        format_message('days_ago', values: {numberOfDays: diff_days.floor})
      end
    end

  end
end
