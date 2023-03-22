class CasOmniauth < OmniauthMethods::Base
  def profile_to_user_attrs(auth)
    {
      first_name: auth.info['nickname'],
      email: auth.info['nickname'] + '@' + auth.info['nickname'] + '.test',
      last_name: auth.info['nickname'].titleize, # FC returns last names in ALL CAPITALS
      locale: AppConfiguration.instance.closest_locale_to('fr-FR')
    }
  end
end
