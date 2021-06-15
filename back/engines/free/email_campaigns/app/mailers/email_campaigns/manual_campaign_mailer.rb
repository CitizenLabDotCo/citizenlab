module EmailCampaigns
  class ManualCampaignMailer < ApplicationMailer
    helper_method :body, :body_text

    layout 'campaign_mailer_minimal'

    def body
      multiloc_service = MultilocService.new
      frontend_service = Frontend::UrlService.new
      @app_configuration = AppConfiguration.instance

      body_html_with_liquid = multiloc_service.t(command[:body_multiloc], recipient)
      template = Liquid::Template.parse(body_html_with_liquid)
      template.render(liquid_params(recipient))
    end

    def body_text
      ActionView::Base.full_sanitizer.sanitize(body)
    end

    protected

    def header_logo_only?
      true
    end

    def subject
      multiloc_service.t(command[:subject_multiloc], recipient)
    end

    def from_email
      email_address_with_name ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co'), from_name(command[:sender], command[:author], recipient)
    end

    private

    def from_name sender_type, author, recipient
      if sender_type == 'author'
        "#{author.first_name} #{author.last_name}"
      elsif sender_type == 'organization'
        MultilocService.new.t(AppConfiguration.instance.settings('core', 'organization_name'), recipient)
      end
    end

    def liquid_params user
      {
        'first_name' => user.first_name,
        'last_name' => user.last_name,
        'locale' => user.locale,
        'email' => user.email,
        'unsubscription_token' => EmailCampaigns::UnsubscriptionToken.find_by(user_id: user.id)&.token
      }
    end

    def home_url
      url_service.home_url(app_configuration: app_configuration, locale: recipient.locale)
    end
  end
end
