class Locale
  attr_reader :locale_sym

  def self.default(config: nil)
    config ||= AppConfiguration.instance
    monolingual(config: config) || new(config.settings('core', 'locales').first)
  end

  def self.monolingual(config: nil)
    config ||= AppConfiguration.instance
    config_locales = config.settings('core', 'locales')
    config_locales.size == 1 ? new(config_locales.first) : nil
  end

  def initialize(locale)
    @locale_sym = locale.to_sym

    raise ClErrors::AssertionError, "Locale #{locale_sym} is not supported" if CL2_SUPPORTED_LOCALES.exclude?(locale_sym)
  end

  def fallback_languages
    mapping_without_en = {
      :'ca-ES' => [:es],
      :'kl-GL' => [:da],
      :'lb-LU' => [:de]
    }
    [
      language,
      *mapping_without_en[locale_sym],
      self.class.new(I18n.default_locale).language
    ].compact.uniq
  end

  def language
    locale_sym.to_s.split('-').first.to_sym
  end

  def language_copy
    I18n.t("locales.#{locale_sym}")
  end
end
