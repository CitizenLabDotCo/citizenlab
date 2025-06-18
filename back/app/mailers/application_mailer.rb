# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: -> { default_from_email }
  layout 'mailer'

  attr_reader :user

  alias recipient user

  delegate :unsubscribe_url, :terms_conditions_url, :privacy_policy_url, to: :url_service
  delegate :first_name, to: :recipient, prefix: true

  helper_method :app_configuration, :app_settings, :header_title, :header_message,
    :show_header?, :preheader, :subject, :user, :recipient, :locale, :count_from, :days_since_publishing,
    :align_direction

  helper_method :organization_name, :recipient_name, :url_service, :multiloc_service,
    :loc, :localize_for_recipient, :localize_for_recipient_and_truncate, :recipient_first_name

  helper_method :unsubscribe_url, :terms_conditions_url, :privacy_policy_url, :gv_gray_logo_url,
    :home_url, :tenant_logo_url, :show_terms_link?, :show_privacy_policy_link?, :format_message,
    :header_logo_only?, :remove_vendor_branding?

  NotImplementedError = Class.new(StandardError)

  def format_message(key, component: nil, escape_html: true, values: {})
    msg = t(".#{key}", **values)
    escape_html ? msg : msg.html_safe
  end

  def preheader
    raise NotImplementedError
  end

  def recipient_name
    @recipient_name ||= UserDisplayNameService.new(app_configuration, recipient).display_name(recipient)
  end

  def locale
    @locale ||= recipient&.locale ? Locale.new(recipient.locale) : Locale.default
  end

  def align_direction
    @align_direction ||= locale.text_direction == 'ltr' ? 'left' : 'right'
  end

  def subject
    raise NotImplementedError
  end

  def header_title
    format_message('header', values: { firstName: recipient_first_name })
  end

  def header_message
    format_message('header_message', values: { firstName: recipient_first_name })
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

    multiloc_service.t(multiloc, locale.to_s).html_safe if multiloc
  end

  # Truncates localized multiloc string, avoiding cutting string in the middle of HTML link and breaking the mail view.
  def localize_for_recipient_and_truncate(multiloc_or_struct, length)
    string = localize_for_recipient(multiloc_or_struct)

    service = SanitizationService.new
    sanitized = service.sanitize string, %i[default] # replace HTML links with text version of URL
    truncated = sanitized.truncate(length, separator: ' ') # truncate the string without cutting the middle of a word.
    linkified = service.linkify truncated # turn any remaining URLs back into HTML links

    linkified.html_safe
  end

  def count_from(value)
    case value
    when Array   then value.length
    when Integer then value
    else              0
    end
  end

  def show_header?
    true
  end

  def header_logo_only?
    false
  end

  def default_config
    {
      subject: subject,
      from: from_email,
      to: to_email,
      reply_to: reply_to_email,
      domain: domain
    }
  end

  def mailgun_headers
    {
      'X-Mailgun-Variables' => mailgun_variables.to_json
    }
  end

  def mailgun_variables
    {
      'cl_tenant_id' => app_configuration.id,
      'cl_delivery_id' => command[:delivery].id
    }
  end

  def email_address_with_name(email, name)
    %("#{name}" <#{email}>)
  end

  def from_email
    email_address_with_name(raw_from_email, organization_name)
  end

  def default_from_email
    ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')
  end

  def raw_from_email
    app_settings.core['from_email'].presence || default_from_email
  end

  def to_email
    email_address_with_name(recipient.email, "#{recipient.first_name} #{recipient.last_name}")
  end

  def reply_to_email
    app_settings.core['reply_to_email'].presence || default_from_email
  end

  def domain
    raw_from_email&.split('@')&.last
  end

  def app_settings
    to_deep_struct(app_configuration.settings)
  end

  def show_terms_link?
    true
  end

  def show_privacy_policy_link?
    true
  end

  def remove_vendor_branding?
    app_configuration.feature_activated?('remove_vendor_branding')
  end

  def organization_name
    @organization_name ||= localize_for_recipient(app_settings.core.organization_name)
  end

  def app_configuration
    AppConfiguration.instance
  end

  def home_url
    @home_url ||= url_service.home_url(app_configuration: app_configuration, locale: locale)
  end

  def tenant_logo_url
    @tenant_logo_url ||= app_configuration.logo.versions.then do |versions|
      versions[:medium].url || versions[:small].url || versions[:large].url || ''
    end
  end

  def gv_gray_logo_url
    logo_languages = %i[en nl fr es da de]
    lang_part = (locale.fallback_languages & logo_languages).first.to_s
    "https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/formerly-logo/formerly_gray_#{lang_part}.png"
  end

  def formatted_todays_date
    I18n.l(Time.zone.today, format: :long)
  end

  def days_since_publishing(resource)
    return unless resource.respond_to?(:published_at)

    (Time.zone.today - resource.published_at.to_date).to_i
  end

  def to_deep_struct(obj)
    case obj
    when Hash
      struct_obj = obj.transform_values { |nested_object| to_deep_struct(nested_object) }
      WhinyOpenStruct.new(struct_obj, raise_exception: false)
    when Array
      obj.map { |nested_object| to_deep_struct(nested_object) }
    else
      obj
    end
  end
end
