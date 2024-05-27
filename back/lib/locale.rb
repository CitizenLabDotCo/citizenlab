class Locale
  attr_reader :locale_sym

  def self.monolingual(config)
    config ||= AppConfiguration.instance
    config_locales = config.settings('core', 'locales')
    config_locales.size == 1 ? new(config_locales.first) : nil
  end

  def initialize(locale)
    @locale_sym = locale.to_sym

    raise ClErrors::AssertionError 'Locale #{locale} is not supported' if !CL2_SUPPORTED_LOCALES.include?(locale)
  end

  def language
    locale # TODO
  end
end
