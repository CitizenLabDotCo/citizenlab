# frozen_string_literal: true

class UserBlockedMailer < ApplicationMailer
  def send_user_blocked_email
    @user = params[:user]

    I18n.with_locale(locale.locale_sym) do
      mail(default_config, &:mjml).tap do |message|
        message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
      end
    end
  end

  def preheader
    format_message('preheader', values: { organizationName: organization_name })
  end

  def subject
    format_message('subject', values: { organizationName: organization_name })
  end

  def header_logo_only?
    true
  end
end
