# frozen_string_literal: true

class EmailConfirmationMailer < ApplicationMailer
  def send_code
    @user = params[:user]

    I18n.with_locale(locale.locale_sym) do
      mail(default_config, &:mjml).tap do |message|
        message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
      end
    end
  end

  def preheader
    I18n.t('confirmations_mailer.send_confirmation_code.preheader', organizationName: organization_name)
  end

  def subject
    I18n.t('confirmations_mailer.send_confirmation_code.subject', organizationName: organization_name)
  end

  def header_logo_only?
    true
  end
end
