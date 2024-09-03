# frozen_string_literal: true

module EmailCampaigns
  class NewIdeaForAdminMailer < ApplicationMailer
    protected

    def subject
      header_title
    end

    private

    def header_title
      format_message("main_header_#{version_suffix}", values: { firstName: recipient_first_name })
    end

    def header_message
      format_message("event_description_#{version_suffix}", values: { authorName: event.post_author_name })
    end

    helper_method :prescreening_version?
    def prescreening_version?
      event.post_publication_status != 'published'
    end

    def version_suffix
      prescreening_version? ? 'prescreening' : 'publication'
    end
  end
end
