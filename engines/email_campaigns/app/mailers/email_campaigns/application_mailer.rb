module EmailCampaigns
  class ApplicationMailer < ActionMailer::Base
    include CampaignHelper

    NotImplementedError = Class.new(StandardError)

    add_template_helper CampaignHelper

    layout 'mailer'

    before_action do
      @command, @campaign = params.values_at(:command, :campaign)
    end

    def campaign_mail
      I18n.with_locale(locale) do
        mail(default_config, &:mjml).tap do |message|
          message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
        end
      end
    end

    attr_reader :command, :campaign

    delegate :unsubscribe_url, :terms_conditions_url, :privacy_policy_url, to: :url_service
    delegate :first_name, to: :recipient, prefix: true

    helper_method :app_configuration, :app_settings, :command, :campaign, :event, :header_title, :header_message,
                  :show_header?, :preheader, :subject, :user, :recipient, :locale, :count_from, :days_since_publishing,
                  :text_direction

    helper_method :organization_name, :recipient_name,
                  :url_service, :multiloc_service, :organization_name,
                  :loc, :localize_for_recipient, :recipient_first_name

    helper_method :unsubscribe_url, :terms_conditions_url, :privacy_policy_url, :home_url, :logo_url,
                  :show_unsubscribe_link?, :show_terms_link?, :show_privacy_policy_link?

    private

    def to_deep_struct(obj)
      case obj
      when Hash  then OpenStruct.new(obj.transform_values(&method(:to_deep_struct)))
      when Array then obj.map(&method(:to_deep_struct))
      else            obj
      end
    end

    def header_title
      format_message('header', values: { firstName: recipient_first_name })
    end

    def header_message
      format_message('header_message')
    end

    def show_header?
      true
    end

    def preheader
      format_message('preheader', values: { organizationName: organization_name })
    end

    def default_config
      {
        subject: subject,
        from: from_email,
        to: to_email,
        reply_to: reply_to_email
      }
    end

    def mailgun_headers
      {
        'X-Mailgun-Variables' => {
          'cl_tenant_id' => Tenant.current.id,  # TODO_MT Customize mailgun vars from the engine?
          'cl_campaign_id' => campaign.id,
          'cl_user_id' => recipient.id
        }.to_json
      }
    end

    def recipient_name
      @recipient_name ||= UserDisplayNameService.new(app_configuration, recipient).display_name(recipient)
    end

    def app_configuration
      @app_configuration ||= AppConfiguration.instance
    end

    def show_unsubscribe_link?
      true
    end

    def show_terms_link?
      true
    end

    def show_privacy_policy_link?
      true
    end

    def recipient
      @recipient ||= command[:recipient]
    end

    alias user recipient

    def locale
      @locale ||= recipient.locale
    end

    def subject
      raise NotImplementedError
    end

    def from_email
      email_address_with_name ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co'), organization_name
    end

    def to_email
      email_address_with_name recipient.email, "#{recipient.first_name} #{recipient.last_name}"
    end

    def reply_to_email
      command[:reply_to] || ENV.fetch('DEFAULT_REPLY_TO_EMAIL', nil) || ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')
    end

    def event
      @event ||= to_deep_struct(command[:event_payload])
    end

    def count_from(value)
      case value
      when Array   then value.length
      when Integer then value
      else              0
      end
    end

    def email_address_with_name(email, name)
      %("#{name}" <#{email}>)
    end

    def url_service
      @url_service ||= Frontend::UrlService.new
    end

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end

    def localize_for_recipient(multiloc_or_struct)
      multiloc = case multiloc_or_struct
                 when Hash       then multiloc_or_struct
                 when OpenStruct then multiloc_or_struct.to_h.stringify_keys
                 end

      multiloc_service.t(multiloc, recipient).html_safe if multiloc
    end

    def app_settings
      @app_settings ||= to_deep_struct(app_configuration.settings)
    end

    def organization_name
      @organization_name ||= localize_for_recipient(app_settings.core.organization_name)
    end

    def home_url
      @home_url ||= url_service.home_url(app_configuration: app_configuration, locale: locale)
    end

    def logo_url
      @logo_url ||= app_configuration.logo.versions.yield_self do |versions|
        versions[:medium].url || versions[:small].url || versions[:large].url || ''
      end
    end

    def formatted_todays_date
      I18n.l(Time.zone.today, format: :long)
    end

    def days_since_publishing(resource)
      return unless resource.respond_to?(:published_at)

      (Time.zone.today - resource.published_at.to_date).to_i
    end

    def text_direction
      if locale =~ /^ar.*$/
        'rtl'
      else
        'ltr'
      end
    end
  end
end
