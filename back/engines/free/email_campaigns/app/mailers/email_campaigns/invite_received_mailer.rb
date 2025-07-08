# frozen_string_literal: true

module EmailCampaigns
  class InviteReceivedMailer < ApplicationMailer
    include EditableWithPreview

    helper_method :invite_expiry_days

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient)
      data = preview_service.preview_data(recipient)
      {
        recipient: recipient,
        event_payload: {
          inviter_first_name: data.initiator.first_name,
          inviter_last_name: data.initiator.last_name,
          invitee_first_name: data.author.first_name,
          invitee_last_name: data.author.last_name,
          invite_text: '<p>Would you like to join our awesome platform?</p>',
          activate_invite_url: Frontend::UrlService.new.invite_url('token', locale: Locale.new(recipient.locale))
        }
      }
    end

    protected

    def invite_expiry_days
      Invite::EXPIRY_DAYS
    end
  end
end
