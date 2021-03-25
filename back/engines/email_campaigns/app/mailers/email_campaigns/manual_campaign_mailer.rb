module EmailCampaigns
  class ManualCampaignMailer < ApplicationMailer
    layout false

    attr_reader :command, :campaign, :recipient, :app_configuration

    def campaign_mail
      @recipient = command[:recipient]
      multiloc_service = MultilocService.new
      frontend_service = Frontend::UrlService.new
      @app_configuration = AppConfiguration.instance

      body_html_with_liquid = multiloc_service.t(command[:body_multiloc], recipient)
      template = Liquid::Template.parse(body_html_with_liquid)
      @body_html = template.render(liquid_params(recipient))
      @body_text = ActionView::Base.full_sanitizer.sanitize(@body_html)

      url = frontend_service.unsubscribe_url_template(app_configuration, campaign.id)
      url_template = Liquid::Template.parse(url)
      @unsubscribe_url = url_template.render(liquid_params(recipient))

      @logo_url = app_configuration.logo.versions[:medium].url
      @terms_conditions_url = frontend_service.terms_conditions_url(app_configuration)
      @privacy_policy_url = frontend_service.privacy_policy_url(app_configuration)
      @host_url = frontend_service.home_url(app_configuration: app_configuration)
      @organization_name = multiloc_service.t(app_configuration.settings('core', 'organization_name'), recipient)

      I18n.with_locale(locale) do
        mail(default_config).tap do |message|
          message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
        end
      end
    end

    protected

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
