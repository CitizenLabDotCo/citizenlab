# frozen_string_literal: true

# Also, see FE validations in front/app/modules/commercial/customizable_homepage_banner/
# TODO: Move this module to some commercial engine (e.g. when we create sth like `configurability`)
module CustomizableHomepageBannerSettings
  def validate_customizable_homepage_banner
    banner_key = 'customizable_homepage_banner'
    return if settings[banner_key] == settings_was[banner_key]

    banner_config = settings[banner_key] || {}
    validate_customizable_homepage_banner_sign_in_status(banner_config, 'signed_out')
    validate_customizable_homepage_banner_sign_in_status(banner_config, 'signed_in')
  end

  private

  def validate_customizable_homepage_banner_sign_in_status(banner_config, status)
    return if banner_config["cta_#{status}_type"] != 'customized_button'

    button_config = banner_config["cta_#{status}_customized_button"]
    error_prefix = "customizable_homepage_banner.cta_#{status}_customized_button"
    validate_customizable_homepage_banner_text(button_config, error_prefix)
    validate_customizable_homepage_banner_url(button_config, error_prefix)
  end

  def validate_customizable_homepage_banner_text(button_config, error_prefix)
    locales = settings.dig('core', 'locales')
    return unless button_config.blank? || locales.any? { |locale| button_config['text'][locale].blank? }

    errors.add("#{error_prefix}.text", I18n.t('errors.messages.blank'))
  end

  def validate_customizable_homepage_banner_url(button_config, error_prefix)
    if button_config.blank? || button_config['url'].blank?
      errors.add("#{error_prefix}.url", I18n.t('errors.messages.blank'))
    # json-schema `pattern` is not used because it tries to validate (and finds an error)
    # even if cta type is not `customized_button`.
    elsif !button_config['url'].match?(%r{^$|^((http://.+)|(https://.+))})
      errors.add("#{error_prefix}.url", I18n.t('errors.messages.invalid'))
    end
  end
end
