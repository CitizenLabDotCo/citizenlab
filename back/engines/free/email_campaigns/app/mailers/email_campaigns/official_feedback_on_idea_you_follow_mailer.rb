# frozen_string_literal: true

module EmailCampaigns
  class OfficialFeedbackOnIdeaYouFollowMailer < ApplicationMailer
    private

    helper_method :author_name
    helper_method :unfollow_url

    def author_name
      localize_for_recipient(event.official_feedback_author_multiloc)
    end

    def unfollow_url
      Frontend::UrlService.new.unfollow_url(Follower.new(followable: idea, user: recipient))
    end

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    def header_title
      format_message('header_title', values: { organizationName: organization_name })
    end

    def header_message
      format_message(
        'header_message',
        values: {
          ideaTitle: localize_for_recipient(event.post_title_multiloc),
          officialName: localize_for_recipient(event.official_feedback_author_multiloc)
        }
      )
    end
  end
end
