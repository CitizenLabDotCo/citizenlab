# frozen_string_literal: true

module EmailCampaigns
  class EventRegistrationConfirmationMailer < ApplicationMailer
    include ActionView::Helpers::SanitizeHelper
    include Rails.application.routes.url_helpers
    layout 'campaign_mailer_minimal'

    helper_method :add_to_calendar_url, :event_description, :event_location, :event_time,
      :event_title, :project_title

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
      strip_tags(description).presence
    end

    def project_title
      localize_for_recipient(event.project_title_multiloc)
    end

    def add_to_calendar_url
      host = AppConfiguration.instance.base_backend_uri
      # In a mailer, the host must be specified explicitly for the url helpers to work
      # because, unlike in a controller, it cannot be inferred from the request.
      web_api_v1_event_url(event.event_attributes.id, format: 'ics', host: host)
    end
  end
end
