# frozen_string_literal: true

class MultilocService
  def initialize(app_configuration: nil)
    @app_configuration = app_configuration
  end

  # @param ignore_blank [Boolean] If true, blank translations (empty or only whitespace)
  #   are considered missing, and the next best translation is returned.
  def t(translations, preferred_locale = nil, ignore_blank: false)
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

    # Determine if a translation is considered present based on the +ignore_blank+ flag.
    is_present = ignore_blank ? ->(t) { t.present? } : ->(t) { !!t }

    # Optimization: return early if we can to avoid instantiating the AppConfiguration.
    preferred_locale ||= I18n.locale.to_s
    preferred_translation = translations[preferred_locale]
    return preferred_translation if is_present.call(preferred_translation)

    platform_locales = app_configuration.settings('core', 'locales')
    locales_by_priority = platform_locales + translations.keys
    result = locales_by_priority.lazy.map { |locale| translations[locale] }.find(&is_present)
    result.is_a?(String) ? result : +'' # return a non-frozen empty string
  end

  def i18n_to_multiloc(key, locales: nil, raise_on_missing: true, **multiloc_substitutions)
    locales ||= app_configuration.settings('core', 'locales')

    locales.each_with_object({}) do |locale, result|
      localised_substitutions = multiloc_substitutions.transform_values { |option| option[locale.to_s] }

      I18n.with_locale(locale) do
        result[locale] = I18n.t(key, raise: true, **localised_substitutions)
      rescue I18n::MissingTranslationData
        raise if raise_on_missing
      end
    end
  end

  # Converts the embedded variables to a liquid template format.
  def i18n_to_multiloc_liquid_version(key, raise_on_missing: true)
    i18n_to_multiloc(key, raise_on_missing:).transform_values do |value|
      value.is_a?(String) ? value.gsub(/%\{(.*?)}/, '{{\1}}') : value
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
