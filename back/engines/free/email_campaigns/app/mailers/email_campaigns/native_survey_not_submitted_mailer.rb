# frozen_string_literal: true

module EmailCampaigns
  class NativeSurveyNotSubmittedMailer < ApplicationMailer
    protected

    def subject
      format_message('subject', values: { organizationName: organization_name })
    end

    private

    def header_title
      format_message('title_native_survey_not_submitted')
    end

    def header_message
      format_message('body_native_survey_not_submitted', values: {
        phaseTitle: localize_for_recipient(event.phase_title_multiloc),
        phaseEndDate: I18n.l(event.phase_end_at, format: '%B %d', locale: locale)
      })
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end
  end
end
