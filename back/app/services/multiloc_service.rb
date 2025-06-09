# frozen_string_literal: true

class MultilocService
  def initialize(app_configuration: nil)
    @app_configuration = app_configuration
  end

  def t(translations, preferred_locale = nil)
    return nil unless translations

    ErrorReporter.handle(ArgumentError) do
      bad_keys = translations.keys.reject { |key| key.is_a?(String) }
      raise ArgumentError, <<~MSG.squish if bad_keys.any?
        translations keys must be strings, but found: #{bad_keys.map(&:inspect)}
      MSG

      raise ArgumentError, <<~MSG.squish unless preferred_locale.nil? || preferred_locale.is_a?(String)
        preferred_locale must be a string, but found: #{preferred_locale.inspect} (#{preferred_locale.class})
      MSG
    end

    # Optimization: return early if we can to avoid instantiating the AppConfiguration.
    preferred_locale ||= I18n.locale.to_s
    return translations[preferred_locale] if translations[preferred_locale]

    platform_locales = app_configuration.settings('core', 'locales')
    locales_by_priority = platform_locales + translations.keys
    result = locales_by_priority.lazy.filter_map { |locale| translations[locale] }.first
    result.is_a?(String) ? result : +'' # return a non-frozen empty string
  end

  def i18n_to_multiloc(key, locales: nil, **multiloc_substitutions)
    (locales || app_configuration.settings('core', 'locales')).each_with_object({}) do |locale, result|
      localised_substitutions = multiloc_substitutions.transform_values { |option| option[locale.to_s] }
      I18n.with_locale(locale) do
        result[locale] = I18n.t(key, raise: true, **localised_substitutions)
      end
    end
  end

  # Converts the embedded variables to a liquid template format.
  def i18n_to_multiloc_liquid_version(key)
    i18n_to_multiloc(key).transform_values do |value|
      value.gsub(/%\{(.*?)}/, '{{\1}}')
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
