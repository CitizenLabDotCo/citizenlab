class Locale
  attr_reader :locale_sym

  def self.monolingual(config: nil)
    config ||= AppConfiguration.instance
    config_locales = config.settings('core', 'locales')
    config_locales.size == 1 ? new(config_locales.first) : nil
  end

  def initialize(locale)
    @locale_sym = locale.to_sym

    raise ClErrors::AssertionError, "Locale #{locale_sym} is not supported" if CL2_SUPPORTED_LOCALES.exclude?(locale_sym)
  end

  def language
    locale # TODO
  end
end
