# frozen_string_literal: true

# This class exists to track and have in one place all operations
# that write important user fields like email and confirmation.
# It makes it easier to understand what and when can happen to user.
#
class UserService
  class << self
    def upsert_in_web_api(new_or_existing_user, user_params, &)
      new_or_existing_user.assign_attributes(user_params)
      yield
      # `on: :create` and `on: :update` callbacks/validations are not called
      new_or_existing_user.save(context: :form_submission)
    end

    def create_in_admin_api(user_params, confirm_user)
      user = User.new(user_params)
      user.locale ||= AppConfiguration.instance.settings('core', 'locales').first
      mark_confirmed_in_memory(user) if confirm_user
      user.save

      user
    end

    def update_in_admin_api(user, user_params, confirm_user)
      mark_confirmed_in_memory(user) if confirm_user
      user.update(user_params)
    end

    def build_in_sso(user_params, confirm_user, locale)
      user = User.new(user_params)
      user.locale = locale

      mark_confirmed_in_memory(user) if confirm_user
      user
    end

    def update_in_sso!(user, user_params, confirm_user)
      mark_confirmed_in_memory(user) if confirm_user
      user.update_merging_custom_fields!(user_params)
    end

    def assign_params_in_accept_invite(user, user_params)
      user.assign_attributes(user_params.merge(invite_status: 'accepted'))
      user
    end

    # User can also be updated in input importer by PATCH /users/:id (`update_in_web_api` is called)
    def build_in_input_importer(user_params, new_user = User.new)
      new_user.assign_attributes(user_params)
      if new_user.email.blank?
        new_user.unique_code = SecureRandom.uuid
      end
      new_user
    end

    def create_in_tenant_template!(user_params)
      update_in_tenant_template!(User.new, user_params)
    end

    def update_in_tenant_template!(user, user_params = {})
      user.assign_attributes(user_params)
      mark_confirmed_in_memory(user)
      user.save!
    end

    private

    # In-memory equivalent of the old `user.confirm` from UserConfirmation concern.
    # Used by build-then-save flows that can't call EmailConfirmation#confirm!
    # because the email_confirmation row doesn't exist until after_create.
    def mark_confirmed_in_memory(user)
      user.email_confirmed_at = Time.zone.now
      user.confirmation_required = false
    end
  end
end
