# frozen_string_literal: true

module EmailCampaigns
  class UserBlockedMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      # The body is conditional (block reason / sign-in date), so only the
      # subject and heading are admin-editable.
      %i[subject_multiloc title_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient, _context)
      recipient.assign_attributes(
        block_start_at: 5.days.ago,
        block_end_at: 5.days.from_now,
        block_reason: 'You breached guideline X'
      )
      { recipient: recipient, event_payload: {} }
    end
  end
end
