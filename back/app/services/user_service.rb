# frozen_string_literal: true

class UserService
  def admin_api_create(user_params, confirm_user)
    user = User.new user_params
    user.locale ||= AppConfiguration.instance.settings('core', 'locales').first
    user.confirm if confirm_user
    user.save

    user
  end

  def admin_api_update(user, user_params, confirm_user)
    user.confirm if confirm_user
    user.update(user_params)
  end

  def sso_build(user_params, confirm_user, locale)
    user = User.new(user_params)
    user.locale = locale if locale
    user.confirm if confirm_user
    user
  end

  def sso_update!(user, user_params, confirm_user)
    user.confirm if confirm_user
    user.update_merging_custom_fields!(user_params)
  end
end
