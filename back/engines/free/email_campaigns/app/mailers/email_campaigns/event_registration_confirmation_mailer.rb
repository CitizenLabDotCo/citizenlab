# frozen_string_literal: true

module EmailCampaigns
  class EventRegistrationConfirmationMailer < ApplicationMailer
    include ActionView::Helpers::SanitizeHelper
    layout 'campaign_mailer_minimal'

    helper_method :event_description, :event_location, :event_time, :event_title,
      :project_title

    private

    def subject
      format_message('subject', values: {
        organizationName: organization_name,
        eventTitle: event_title
      })
    end

    def event_title
      localize_for_recipient(event.event_attributes.title_multiloc)
    end

    def event_time
      start_at = I18n.l(event.event_attributes.start_at, format: :short, locale: locale)
      end_at = I18n.l(event.event_attributes.end_at, format: :short, locale: locale)

      "#{start_at} – #{end_at}"
    end

    def event_location
      location = event.event_attributes.address_1.to_s

      address_details = localize_for_recipient(event.event_attributes.address_2_multiloc)
      if address_details.present?
        location += location.present? ? "\n(#{address_details})" : address_details
      end

      location.presence
    end

    def event_description
      description = localize_for_recipient(event.event_attributes.description_multiloc)
      # remove html tags
      strip_tags(description).presence
    end

    def project_title
      localize_for_recipient(event.project_title_multiloc)
    end
  end
end
