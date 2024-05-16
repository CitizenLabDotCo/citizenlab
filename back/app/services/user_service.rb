# frozen_string_literal: true

class UserService
  def admin_api_create(user_params, confirm_user)
    user = User.new user_params
    user.locale ||= AppConfiguration.instance.settings('core', 'locales').first
    user.save

    # The validations and hooks on the user model don't allow us to set
    # confirm before save on creation, they'll get reset. So we're forced to
    # do a 2nd save operation.
    if confirm_user
      user.confirm
      user.save
    end

    user
  end

  def admin_api_update(user, user_params, confirm_user)
    user.assign_attributes(user_params)
    user.confirm if confirm_user
    user.save
  end
end
