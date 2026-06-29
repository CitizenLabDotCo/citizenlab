# frozen_string_literal: true

module EmailCampaigns
  class EmailConfirmationMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      # No button: a confirmation-code email contains a code, not a link.
      %i[subject_multiloc title_multiloc intro_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient, _context)
      { recipient: recipient, event_payload: { code: '1234' } }
    end
  end
end
