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
      build_user_confirmation(user) if confirm_user
      user.save

      user
    end

    def update_in_admin_api(user, user_params, confirm_user)
      build_user_confirmation(user) if confirm_user
      user.update(user_params)
    end

    def build_in_sso(user_params, confirm_user, locale)
      # If the SSO returns an unconfirmed email, we still need to
      # confirm it. This is done by putting the email in new_email and leaving email blank.
      # Putting an unconfirmed email directly in email is only done
      # when creating a user in the normal email sign up flow.
      if user_params[:email].present? && !confirm_user
        user_params = user_params.except(:email).merge(new_email: user_params[:email])
      end

      user = User.new(user_params)
      user.locale = locale

      build_user_confirmation(user) if confirm_user && user.email.present?
      user
    end

    # Updates the user with attributes from the auth response if `updateable_user_attrs` is set.
    # Overwrites current attributes by default unless `overwrite_attrs?` is set to false on the authver method.
    # @param [User] user
    # @param auth the omniauth auth hash
    # @param [OmniauthMethods::Base] authver_method
    def update_in_sso!(user, auth, authver_method)
      attrs = authver_method.updateable_user_attrs
      sso_user_attrs = authver_method.profile_to_user_attrs(auth)
      user_params = sso_user_attrs.slice(*attrs).compact
      user_params.delete(:remote_avatar_url) if user.avatar.present? # don't overwrite avatar if already present

      resolve_sso_email!(user, user_params, sso_user_attrs[:email], authver_method.email_confirmed?(auth))

      user.update_merging_custom_fields!(user_params)
    end

    def assign_params_in_accept_invite(user, user_params, confirm_user = false)
      user.assign_attributes(user_params.merge(invite_status: 'accepted'))
      # If the user's email came from/matches the authver one, and the provider
      # says it was confirmed: we mark the user's email as confirmed.
      user.email_confirmation.confirm! if confirm_user
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
      build_user_confirmation(user)
      user.save!
    end

    private

    # Decides what to do with the email returned by the SSO and mutates
    # `user_params` (and the user's confirmation state) accordingly.
    #
    # - If the SSO returned no email, nothing is touched.
    # - If we're not allowed to update the email (`:email` not in the params),
    #   we only confirm the email the user already has when the SSO vouches for
    #   that exact same email.
    # - If we are allowed to update the email:
    #   - a confirmed SSO email becomes the user's (confirmed) email;
    #   - an unconfirmed SSO email is ignored when the user already has a
    #     confirmed email, otherwise it goes into `new_email` to be confirmed
    #     later (mirroring `build_in_sso`).
    def resolve_sso_email!(user, user_params, sso_email, sso_email_confirmed)
      return if sso_email.blank?

      unless user_params.key?(:email)
        build_user_confirmation(user) if sso_email_confirmed && sso_email == user.email
        return
      end

      if sso_email_confirmed
        user_params[:email] = sso_email
        build_user_confirmation(user)
      elsif user.email.present? && !user.confirmation_required
        # Don't overwrite an already-confirmed email with an unconfirmed one.
        user_params.delete(:email)
      else
        user_params.delete(:email)
        user_params[:new_email] = sso_email
      end
    end

    # In-memory equivalent of the old `user.confirm` from UserConfirmation concern.
    # Used by build-then-save flows that can't call EmailConfirmation#confirm!
    # because the email_confirmation row doesn't exist until after_create.
    def build_user_confirmation(user)
      user.email_confirmed_at = Time.zone.now
      user.confirmation_required = false
    end
  end
end
