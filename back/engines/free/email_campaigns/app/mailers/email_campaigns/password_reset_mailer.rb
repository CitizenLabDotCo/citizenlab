# frozen_string_literal: true

module EmailCampaigns
  class PasswordResetMailer < ApplicationMailer
    include EditableWithPreview

    def editable
      %i[subject_multiloc title_multiloc intro_multiloc button_text_multiloc]
    end

    def substitution_variables
      {
        organizationName: organization_name
      }
    end

    def preview_command(recipient, _context)
      {
        recipient: recipient,
        event_payload: {
          password_reset_url: Frontend::UrlService.new.reset_password_url('preview-token', locale: Locale.new(recipient.locale))
        }
      }
    end
  end
end
