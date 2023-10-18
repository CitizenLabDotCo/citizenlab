# frozen_string_literal: true

module EmailCampaigns
  class EventUpcomingMailer < ApplicationMailer
    include Rails.application.routes.url_helpers
    layout 'campaign_mailer_minimal'
    helper_method :event_title, :event_date, :event_location, :event_link, :event_description, :event_project, :add_to_calendar_url

    private

    def event_title
      localize_for_recipient(event.event_title_multiloc)
    end

    def event_date
      start_at = I18n.l(Time.parse(event.event_start_at), format: :short, locale: locale)
      end_at = I18n.l(Time.parse(event.event_end_at), format: :short, locale: locale)

      "#{start_at} – #{end_at}"
    end

    def event_location
      localize_for_recipient(event.event_location_multiloc) if event.event_location_multiloc
    end

    def event_link
      event.event_online_link
    end

    def event_description
      localize_for_recipient(event.event_description_multiloc)
    end

    def event_project
      localize_for_recipient(event.project_title_multiloc)
    end

    def add_to_calendar_url
      host = AppConfiguration.instance.base_backend_uri
      # In a mailer, the host must be specified explicitly for the url helpers to work
      # because, unlike in a controller, it cannot be inferred from the request.
      web_api_v1_event_url(event.event_id, format: 'ics', host: host)
    end

    def subject
      format_message('subject')
    end

    def header_title
      format_message('main_header')
    end

    def preheader
      format_message('preheader')
    end
  end
end
