class MultilocService

  def t translations, user=nil
    return nil unless translations
    locales = AppConfiguration.instance.settings('core','locales')
    user_locale = user&.locale || I18n.locale.to_s
    result = ([user_locale] + locales + translations.keys).each do |locale|
      break translations[locale] if translations[locale]
    end
    result.kind_of?(String) ? result : ""
  end

  def i18n_to_multiloc key, locales: nil
    (locales || AppConfiguration.instance.settings('core','locales')).each_with_object({}) do |locale, result|
      I18n.with_locale(locale) do
        result[locale] = I18n.t(key, raise: true)
      end
    end
  end

  def block_to_multiloc
    AppConfiguration.instance.settings('core','locales').each_with_object({}) do |locale, result|
      I18n.with_locale(locale) do
        result[locale] = yield(locale)
      end
    end
  end

  def is_empty? multiloc
    !multiloc || multiloc.values.all?(&:blank?)
  end

end
