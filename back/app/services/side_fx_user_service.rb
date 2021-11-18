# frozen_string_literal: true

class SideFxUserService
  include SideFxHelper

  def before_create(user, current_user)
  end

  def after_create(user, current_user)
    TrackUserJob.perform_later(user)
    GenerateUserAvatarJob.perform_later(user)
    LogActivityJob.set(wait: 10.seconds).perform_later(user, 'created', user, user.created_at.to_i)
    UpdateMemberCountJob.perform_later
    if user.admin?
      LogActivityJob.set(wait: 5.seconds).perform_later(user, 'admin_rights_given', current_user, user.created_at.to_i)
    end
    user.create_email_campaigns_unsubscription_token
  end

  def before_update(user, current_user); end

  def after_update(user, current_user)
    TrackUserJob.perform_later(user)
    LogActivityJob.perform_later(user, 'changed', current_user, user.updated_at.to_i)
    if user.registration_completed_at_previously_changed?
      LogActivityJob.perform_later(user, 'completed_registration', current_user, user.updated_at.to_i)
    end
    UpdateMemberCountJob.perform_later

    roles_side_fx(current_user, user)
  end

  def after_destroy(frozen_user, current_user)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_user), 'deleted', current_user, Time.now.to_i)
    UpdateMemberCountJob.perform_later
    RemoveUserFromIntercomJob.perform_later(frozen_user.id)
    RemoveUsersFromSegmentJob.perform_later([frozen_user.id])
  end

  private

  def roles_side_fx(current_user, user)
    gained_roles(user).each { |role| role_created_side_fx(role, user, current_user) }
    lost_roles(user).each { |role| role_destroyed_side_fx(role, user, current_user) }
  end

  def role_created_side_fx(role, user, current_user)
    new_admin(user, current_user) if role['type'] == 'admin'
  end

  def new_admin(user, current_user)
    LogActivityJob
      .set(wait: 5.seconds)
      .perform_later(user, 'admin_rights_given', current_user, user.updated_at.to_i)
  end

  # Dummy method to allow some extensibility.
  #
  # @param [Hash] _role
  # @param [User] _user
  # @param [User] _current_user
  def role_destroyed_side_fx(_role, _user, _current_user); end

  def lost_roles(user)
    return [] unless user.roles_previously_changed?

    old_roles, new_roles = user.roles_previous_change
    old_roles.to_a - new_roles.to_a
  end

  def gained_roles(user)
    return [] unless user.roles_previously_changed?

    old_roles, new_roles = user.roles_previous_change
    new_roles.to_a - old_roles.to_a
  end
end

::SideFxUserService.prepend(UserConfirmation::Patches::SideFxUserService)

SideFxUserService.prepend_if_ee('ProjectManagement::Patches::SideFxUserService')
SideFxUserService.prepend_if_ee('Matomo::Patches::SideFxUserService')
