# frozen_string_literal: true

# This class exists to track and have in one place all operations
# that write important user fields like email and confirmation.
# It makes it easier to understand what and when can happen to user.
#
class UserService
  def web_api_create(new_user, user_params, &)
    new_user.assign_attributes(user_params)
    yield
    new_user.save(context: :form_submission) # `on: :create` and `on: :update` callbacks/validations are not called
  end

  def web_api_update(user, user_params, &)
    user.assign_attributes(user_params)
    yield
    user.save(context: :form_submission) # `on: :create` and `on: :update` callbacks/validations are not called
  end

  def admin_api_create(user_params, confirm_user)
    user = User.new(user_params)
    user.locale ||= AppConfiguration.instance.settings('core', 'locales').first
    user.confirm if confirm_user
    user.save

    user
  end

  def admin_api_update(user, user_params, confirm_user)
    user.confirm if confirm_user
    user.update(user_params)
  end

  # If SSO method doesn't provide email, user enters it manually
  # (`web_api_update` is called)
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

  def accept_invite_assign_params(user, user_params)
    user.assign_attributes(user_params.merge(invite_status: 'accepted'))
  end

  # User can also be updated in input importer by PATCH /users/:id (`web_api_update` is called)
  def input_importer_build(user_params, new_user = User.new)
    new_user.assign_attributes(user_params)
    if new_user.email.blank?
      new_user.unique_code = SecureRandom.uuid
    end
    new_user
  end

  def tenant_template_update!(user, user_params = {})
    user.assign_attributes(user_params)
    user.confirm
    user.save!
  end
end
