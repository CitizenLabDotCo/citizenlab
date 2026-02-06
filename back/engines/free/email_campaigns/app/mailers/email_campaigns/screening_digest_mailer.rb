# frozen_string_literal: true

module EmailCampaigns
  class ScreeningDigestMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        count: event&.total_screening_count,
        firstName: recipient_first_name,
        organizationName: organization_name
      }
    end

    def preview_command(recipient, _context)
      idea_status = IdeaStatus.find_by(code: 'prescreening')
      total_screening_count = Idea.where(idea_status: idea_status).count
      screening_url = Frontend::UrlService.new.input_manager_url(
        status: idea_status,
        tab: 'statuses'
      )

      {
        recipient: recipient,
        event_payload: { total_screening_count:, screening_url: }
      }
    end
  end
end
