class Locale
  attr_reader :locale_sym

  delegate :to_s, to: :locale_sym

  def self.default(config: nil)
    config ||= AppConfiguration.instance
    monolingual(config: config) || new(config.settings('core', 'locales').first)
  end

  # Returns the monolingual locale from the app_configuration if there is only one locale configured, otherwise nil
  def self.monolingual(config: nil)
    config ||= AppConfiguration.instance
    config_locales = config.settings('core', 'locales')
    config_locales.size == 1 ? new(config_locales.first) : nil
  end

  def initialize(locale)
    @locale_sym = locale.to_sym

    raise ClErrors::AssertionError, "Locale #{locale_sym} is not supported" if CL2_SUPPORTED_LOCALES.exclude?(locale_sym)
  end

  def ==(other)
    self.class == other.class && locale_sym == other.locale_sym
  end

  def text_direction
    /^ar.*$/.match?(locale_sym) ? 'rtl' : 'ltr'
  end

  def resolve_multiloc(multiloc)
    return multiloc[to_s] if multiloc.key?(to_s)

    preferred_key = multiloc.keys.min_by { |key| fallback_languages.index(Locale.new(key).language) || fallback_languages.size }
    multiloc[preferred_key] || multiloc.values.first
  end

  def fallback_languages
    mapping_without_en = {
      'ca-ES': [:es],
      'kl-GL': [:da],
      'lb-LU': [:de]
    }
    [
      language,
      *mapping_without_en[locale_sym],
      self.class.new(I18n.default_locale).language
    ].compact.uniq
  end

  def language
    to_s.split('-').first.to_sym
  end

  def language_copy
    I18n.t("locales.#{locale_sym}")
  end
end
