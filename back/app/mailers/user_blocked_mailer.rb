# frozen_string_literal: true

class UserBlockedMailer < ApplicationMailer
  def send_user_blocked_email
    @user = params[:user]

    I18n.with_locale(locale) do
      mail(default_config, &:mjml).tap do |message|
        message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
      end
    end
  end

  def subject
    t('.subject', organizationName: organization_name)
  end

  def message_user_blocked_with_reason
    t('.message_user_blocked_with_reason', organizationName: organization_name)
  end

  def message_user_blocked_without_reason
    t('.message_user_blocked_with_reason', organizationName: organization_name, termsAndConditionsUrl: terms_conditions_url)
  end

  def header_logo_only?
    true
  end

  def link_to_terms_and_conditions
    Frontend::UrlService.new.terms_conditions_url
  end
end
