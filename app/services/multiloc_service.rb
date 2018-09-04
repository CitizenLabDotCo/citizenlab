class MultilocService

  def t translations, user=nil
    return nil unless translations
    tenant_locales = Tenant.settings('core','locales')
    user_locale = user&.locale || I18n.locale.to_s
    result = ([user_locale] + tenant_locales + translations.keys).each do |locale|
      break translations[locale] if translations[locale]
    end
    result.kind_of?(String) ? result : ""
  end

  def i18n_to_multiloc key
    Tenant.settings('core','locales').each_with_object({}) do |locale, result|
      I18n.with_locale(locale) do
        result[locale] = I18n.t(key, raise: true)
      end
    end
  end
end