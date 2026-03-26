# frozen_string_literal: true

module EmailCampaigns
  class NativeSurveyNotSubmittedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name,
        phaseTitle: localize_for_recipient(event&.phase_title_multiloc)
      }
    end

    # NOTE: This preview uses the phase context when available to render a more realistic preview.
    def preview_command(recipient, context)
      data = preview_service.preview_data(recipient)
      context_project_url = context && Frontend::UrlService.new.model_to_url(context.project, locale: Locale.new(recipient.locale))
      {
        recipient: recipient,
        event_payload: {
          survey_url: context ? "#{context_project_url}/ideas/new?phase_id=#{context.id}" : data.phase.url,
          phase_title_multiloc: context&.title_multiloc || data.phase.title_multiloc,
          phase_end_at: 10.days.from_now.beginning_of_day
        }
      }
    end

    private

    helper_method :survey_end_date

    def survey_end_date
      return unless event&.phase_end_at

      end_at = event.phase_end_at.in_time_zone

      if end_at.seconds_since_midnight.zero?
        date = I18n.l(end_at.to_date - 1.day, format: :long, locale: locale.locale_sym)
        format_message('submissions_close_on_date', values: { date: date })
      else
        datetime = I18n.l(end_at, format: :long, locale: locale.locale_sym)
        format_message('submissions_close_at_time', values: { datetime: datetime })
      end
    end
  end
end
