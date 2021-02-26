module EmailCampaigns
  class CommentMarkedAsSpamMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { 
        firstName: event.initiating_user_first_name, 
        lastName: event.initiating_user_last_name, 
        organizationName: organization_name 
      })
    end

    private

    def header_title
      format_message('title_comment_spam_report', values: { 
        firstName: event.initiating_user_first_name, 
        lastName: event.initiating_user_last_name 
      })
    end

    def header_message
      format_message('event_description', 
        values: { post: localize_for_recipient(event.post_title_multiloc) }, 
        escape_html: false
        )
    end

    def preheader
      format_message('preheader')
    end
  end
end