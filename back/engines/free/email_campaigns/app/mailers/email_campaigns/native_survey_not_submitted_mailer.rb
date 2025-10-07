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
          phase_end_at: context ? context.end_at : Time.now + 10.days
        }
      }
    end

    private

    helper_method :survey_end_date

    def survey_end_date
      end_date = event&.phase_end_at ? I18n.l(event.phase_end_at, format: '%B %d', locale: locale.locale_sym) : nil
      return unless end_date

      format_message('submissions_close', values: { phaseEndDate: end_date })
    end
  end
end
