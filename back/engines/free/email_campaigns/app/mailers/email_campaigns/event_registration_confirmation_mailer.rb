# frozen_string_literal: true

module EmailCampaigns
  class EventRegistrationConfirmationMailer < ApplicationMailer
    include EditableWithPreview
    include ActionView::Helpers::SanitizeHelper
    include Rails.application.routes.url_helpers
    layout 'campaign_mailer_minimal'

    helper_method :add_to_calendar_url, :event_description, :event_location, :event_time,
      :event_title, :project_title

    def campaign_mail
      # TODO: Generate a preview ICS instead? Or move to the campaign / preview service?
      if event&.event_attributes&.id
        attachments['event.ics'] = Events::IcsGenerator.new.generate_ics(
          Event.find(event.event_attributes.id),
          locale.to_s
        )
      end

      super
    end

    def editable
      %i[subject_multiloc title_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        firstName: recipient&.first_name,
        eventTitle: event_title,
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          event_attributes: {
            id: nil,
            start_at: Time.now + 1.day,
            title_multiloc: { 'en' => 'Event Title', 'fr' => 'Titre de l’événement' },
            end_at: Time.now + 1.day + 2.hours,
            address1: nil, # TODO: Add a proper address
            address2_multiloc: nil
          },
          event_url: data.idea.url,
          project_title_multiloc: data.project.title_multiloc,
          project_url: data.project.url,
          image_url: data.idea.url # TODO: Add a proper image URL for the idea
        }
      }
    end

    private

    def event_title
      localize_for_recipient(event_details&.title_multiloc)
    end

    def event_time
      timezone = AppConfiguration.timezone

      start_at = I18n.l(
        timezone.at(event&.event_attributes&.start_at),
        format: :short, locale: locale.locale_sym
      )

      end_at = I18n.l(
        timezone.at(event_details&.end_at),
        format: :short, locale: locale.locale_sym
      )

      "#{start_at} – #{end_at}"
    end

    def event_location
      location = event_details&.address_1&.to_s

      address_details = localize_for_recipient(event_details&.address_2_multiloc)
      if address_details.present?
        location += location.present? ? "\n(#{address_details})" : address_details
      end

      location.presence
    end

    def project_title
      localize_for_recipient(event&.project_title_multiloc)
    end

    def add_to_calendar_url
      host = AppConfiguration.instance.base_backend_uri
      # In a mailer, the host must be specified explicitly for the url helpers to work
      # because, unlike in a controller, it cannot be inferred from the request.
      web_api_v1_event_url(event_details&.id, format: 'ics', host: host)
    end

    def event_details
      event&.event_attributes
    end
  end
end
