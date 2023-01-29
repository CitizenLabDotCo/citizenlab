# frozen_string_literal: true

class MultilocService
  def initialize(app_configuration: nil)
    @app_configuration = app_configuration
  end

  def t(translations, user = nil)
    return nil unless translations

    locales = app_configuration.settings('core', 'locales')
    user_locale = user&.locale || I18n.locale.to_s
    result = ([user_locale] + locales + translations.keys).each do |locale|
      break translations[locale] if translations[locale]
    end
    result.is_a?(String) ? result : +'' # return a non-frozen empty string
  end

  def i18n_to_multiloc(key, locales: nil)
    (locales || app_configuration.settings('core', 'locales')).each_with_object({}) do |locale, result|
      I18n.with_locale(locale) do
        result[locale] = I18n.t(key, raise: true)
      end
    end
  end

  def block_to_multiloc
    app_configuration.settings('core', 'locales').each_with_object({}) do |locale, result|
      I18n.with_locale(locale) do
        result[locale] = yield(locale)
      end
    end
  end

  def empty?(multiloc)
    !multiloc || multiloc.values.all?(&:blank?)
  end

  private

  def app_configuration
    @app_configuration || AppConfiguration.instance
  end
end
