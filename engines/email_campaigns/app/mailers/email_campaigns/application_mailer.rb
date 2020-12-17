module EmailCampaigns
  class ApplicationMailer < ActionMailer::Base
    add_template_helper CampaignHelper

    DEFAULT_SENDER = ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')

    layout 'mailer'

    default from: DEFAULT_SENDER,
            reply_to: DEFAULT_SENDER

    before_action do
      @command = params[:command]
    end

    def campaign_mail(_campaign, command)
      @command = command

      I18n.with_locale(locale) do
        message = mail(default_config) & :mjml
        message.mailgun_headers = mailgun_headers if ActionMailer::Base.delivery_method == :mailgun
        message
      end
    end

    def self.sender_email
      DEFAULT_SENDER
    end

    helper_method :organization_name, :event_payload, :tenant, :recipient_name, :recipient, :locale, :user,
                  :url_service, :multiloc_service, :subject, :organization_name, :loc, :event_payload

    private

    def default_config
      email_address_with_name(address, name)
      {
        subject: subject,
        from: email_address_with_name(self.class.sender_email, organization_name),
        to: email_address_with_name(recipient.email, recipient_name)
      }
    end

    def mailgun_headers
      {
        'X-Mailgun-Variables' => {
          'cl_tenant_id' => tenant.id,
          'cl_campaign_id' => campaign.id,
          'cl_user_id' => recipient.id,
        }.to_json
      }
    end

    def recipient_name
      @recipient_name ||= UserDisplayNameService.new(tenant, recipient).display_name(recipient)
    end

    def tenant
      @tenant ||= Tenant.current
    end

    def recipient
      @recipient ||= @command.dig(:recipient)
    end

    alias user recipient

    def locale
      @locale ||= @recipient.locale
    end

    def url_service
      @url_service ||= Frontend::UrlService.new
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end

    def subject
      raise NotImplementedError
    end

    def organization_name
      @organization_name ||= t(@tenant.settings.dig('core', 'organization_name'), @user)
    end

    def loc(*args)
      MultilocService.new.t(*args)
    end

    def event_payload(*dig_keys)
      return @command[:event_payload] if dig_keys.empty?

      @command.deep_symbolize_keys.dig(:event_payload, *dig_keys.map(&:to_sym))
    end
  end
end
