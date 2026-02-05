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
      data = preview_service.preview_data(recipient)
      prescreening_status_id = IdeaStatus.find_by(code: 'prescreening')&.id
      url_service = Frontend::UrlService.new
      {
        recipient: recipient,
        event_payload: {
          total_screening_count: 12,
          projects: [
            {
              project_id: data.project.id,
              title_multiloc: data.project.title_multiloc,
              screening_count: 5,
              screening_url: "#{url_service.admin_project_url(data.project.id)}/ideas?status=#{prescreening_status_id}&tab=statuses"
            },
            {
              project_id: SecureRandom.uuid,
              title_multiloc: { en: 'Community Center Renovation' },
              screening_count: 4,
              screening_url: '#'
            },
            {
              project_id: SecureRandom.uuid,
              title_multiloc: { en: 'Budget Priorities 2024' },
              screening_count: 3,
              screening_url: '#'
            }
          ],
          screening_overview_url: "#{url_service.admin_ideas_url}?status=#{prescreening_status_id}&tab=statuses"
        }
      }
    end
  end
end
