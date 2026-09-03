# frozen_string_literal: true

module EmailCampaigns
  class MergeAccountConfirmationMailer < ApplicationMailer
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
      { recipient: recipient, event_payload: { code: '1234', email: recipient.email } }
    end

    # Goes to the address whose ownership is being proved, which is the whole point
    # of the code - not to the recipient, who by definition has no email yet.
    #
    # Deliberately no display name: the recipient is the SSO account, and anyone can
    # type any address here. Greeting a stranger's inbox by the SSO user's real name
    # would leak it to whoever actually owns that address.
    def to_email
      event.email
    end
  end
end
