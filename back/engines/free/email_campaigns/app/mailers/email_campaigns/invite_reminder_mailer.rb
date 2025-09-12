# frozen_string_literal: true

module EmailCampaigns
  class InviteReminderMailer < ApplicationMailer
    include EditableWithPreview

    helper_method :invite_expires_in_days

    def editable
      %i[subject_multiloc title_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient, _context)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          inviter_first_name: data.initiator.first_name,
          inviter_last_name: data.initiator.last_name,
          invitee_first_name: data.author.first_name,
          invitee_last_name: data.author.last_name,
          invite_text: '<p>Would you like to join our awesome platform?</p>',
          invite_created_at: 50.hours.ago,
          activate_invite_url: Frontend::UrlService.new.invite_url('token', locale: Locale.new(recipient.locale))
        }
      }
    end

    protected

    def invite_expires_in_days(created_at)
      (created_at - Invite::EXPIRY_DAYS.days.ago).to_i / 1.day.to_i # days remaining in seconds / seconds in a day
    end
  end
end
