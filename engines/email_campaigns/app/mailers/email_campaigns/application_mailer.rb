module EmailCampaigns
  class ApplicationMailer < ActionMailer::Base
    include CampaignHelper

    add_template_helper CampaignHelper

    DEFAULT_SENDER = ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')

    layout 'mailer'

    default from: DEFAULT_SENDER,
            reply_to: DEFAULT_SENDER

    before_action do
      @command, @campaign = params.values_at(:command, :campaign)
    end

    def campaign_mail
      I18n.with_locale(locale) do
        message = mail(default_config, &:mjml)
        message.mailgun_headers = mailgun_headers if ActionMailer::Base.delivery_method == :mailgun
        message
      end
    end

    def self.sender_email
      DEFAULT_SENDER
    end

    attr_reader :command, :campaign

    helper_method :organization_name, :event_payload, :tenant, :recipient_name, :recipient, :locale, :user,
                  :url_service, :multiloc_service, :subject, :organization_name, :loc, :event_payload, :command,
                  :count_from_event_payload, :localize_for_recipient, :campaign, :tenant_home_url,
                  :header, :header_message, :preheader

    delegate :unsubscribe_url, :terms_conditions_url, :privacy_policy_url, :home_url, to: :url_service
    delegate :first_name, to: :recipient, prefix: true

    helper_method :unsubscribe_url, :terms_conditions_url, :privacy_policy_url, :home_url, :recipient_first_name

    private

    def header
      format_message('header', values: { firstName: recipient_first_name })
    end

    def header_message
      format_message('header_message')
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end

    def default_config
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
      @locale ||= recipient.locale
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
      @organization_name ||= localize_for_recipient(tenant.settings.dig('core', 'organization_name'))
    end

    def event_payload(*dig_keys)
      dig_keys.flatten!
      return command[:event_payload] if dig_keys.empty?

      dig_keys = dig_keys.first.to_s.split('.') if dig_keys.first.to_s.include?('.')
      dig_keys = dig_keys.map(&:to_sym).unshift(:event_payload)
      command.deep_symbolize_keys.dig(*dig_keys)
    end

    def count_from_event_payload(*dig_keys)
      event_payload(*dig_keys).yield_self do |count|
        case count
        when Array   then count.length
        when Integer then count
        else              0
        end
      end
    end

    def email_address_with_name(email, name)
      %("#{name}" <#{email}>)
    end

    def localize_for_recipient(multiloc_or_string_key)
      return multiloc_service.t(multiloc_or_string_key, recipient) if multiloc_or_string_key.is_a?(Hash)

      multiloc = event_payload(multiloc_or_string_key.split('.'))
      multiloc_service.t(multiloc, recipient)
    end

    def tenant_home_url
      home_url(tenant: tenant, locale: locale)
    end
  end
end
