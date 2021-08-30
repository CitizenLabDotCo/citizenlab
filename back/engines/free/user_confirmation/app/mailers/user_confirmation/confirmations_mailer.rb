module UserConfirmation
  class ConfirmationsMailer < ApplicationMailer
    def send_confirmation_code
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

    def header_logo_only?
      true
    end
  end
end
