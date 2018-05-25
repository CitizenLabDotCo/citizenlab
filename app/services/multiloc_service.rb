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
end