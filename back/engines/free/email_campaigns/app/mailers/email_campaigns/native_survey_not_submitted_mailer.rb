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

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          survey_url: data.phase.url,
          phase_title_multiloc: data.phase.title_multiloc,
          phase_end_at: Time.now + 10.days
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
