# frozen_string_literal: true

class ConfirmationsMailer < ApplicationMailer
  def send_confirmation_code
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

  def to_email
    email = recipient.new_email.presence || recipient.email
    email_address_with_name(email, "#{recipient.first_name} #{recipient.last_name}")
  end

  def subject
    format_message('subject', values: { organizationName: organization_name })
  end

  def header_logo_only?
    true
  end
end
