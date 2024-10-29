# frozen_string_literal: true

module EmailCampaigns
  class ProjectPublishedMailer < ApplicationMailer
    private

    def preheader
      format_message('preheader')
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
          # post_title_multiloc is never present.
          # TODO: fix. We previously removed this field from the event https://github.com/CitizenLabDotCo/citizenlab/pull/5556/files#diff-ade4ca4ef24ba6dab628047c521bfc1addf2e0255d401c931124ec7fea5a07f0L78
          ideaTitle: localize_for_recipient(event['post_title_multiloc']),
          organizationName: organization_name
        }
      )
    end
  end
end
