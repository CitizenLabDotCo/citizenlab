# frozen_string_literal: true

module EmailCampaigns
  class NewEmailConfirmationMailer < ApplicationMailer
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

    # The whole point of this email is to confirm a not-yet-active address, so
    # it must be sent to new_email rather than the current (confirmed) email.
    def to_email
      email_address_with_name(recipient.new_email, "#{recipient.first_name} #{recipient.last_name}")
    end
  end
end
