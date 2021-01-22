module EmailCampaigns
  class ManualCampaignMailer < ApplicationMailer
    layout false

    attr_reader :command, :campaign, :recipient, :tenant

    def campaign_mail
      @recipient = command[:recipient]
      multiloc_service = MultilocService.new
      frontend_service = Frontend::UrlService.new
      @tenant = Tenant.current

      body_html_with_liquid = multiloc_service.t(command[:body_multiloc], recipient)
      template = Liquid::Template.parse(body_html_with_liquid)
      @body_html = template.render(liquid_params(recipient))
      @body_text = ActionView::Base.full_sanitizer.sanitize(@body_html)

      url = frontend_service.unsubscribe_url_template(tenant, campaign.id)
      url_template = Liquid::Template.parse(url)
      @unsubscribe_url = url_template.render(liquid_params(recipient))

      @tenant_logo_url = tenant.logo.versions[:medium].url
      @terms_conditions_url = frontend_service.terms_conditions_url(tenant: tenant)
      @privacy_policy_url = frontend_service.privacy_policy_url(tenant: tenant)
      @host_url = frontend_service.home_url(tenant: tenant)
      @organization_name = multiloc_service.t(Tenant.settings('core', 'organization_name'), recipient)

      I18n.with_locale(locale) do
        mail(default_config, &:mjml).tap do |message|
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
        MultilocService.new.t(Tenant.settings('core', 'organization_name'), recipient)
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

    def tenant_home_url
      home_url(tenant: tenant, locale: recipient.locale)
    end
  end
end
