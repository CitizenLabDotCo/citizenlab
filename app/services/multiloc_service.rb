class MultilocService

  def t translations, user=nil
    tenant_locales = Tenant.settings('core','locales')
    # user_locale = user.locale
    user_locale = I18n.locale || user&.locale
    ([user_locale] + tenant_locales).each do |locale|
      break translations[locale] if translations[locale].present?
    end
  end
end