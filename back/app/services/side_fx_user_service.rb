# frozen_string_literal: true

class SideFxUserService
  include SideFxHelper

  def before_create(user, current_user); end

  def after_create(user, current_user)
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
    LogActivityJob.perform_later(user, 'changed', current_user, user.updated_at.to_i)
    if user.registration_completed_at_previously_changed?
      LogActivityJob.perform_later(user, 'completed_registration', current_user, user.updated_at.to_i)
    end
    after_roles_changed current_user, user if user.roles_previously_changed?

    UpdateMemberCountJob.perform_later
  end

  def after_destroy(frozen_user, current_user)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_user), 'deleted', current_user, Time.now.to_i)
    UpdateMemberCountJob.perform_later
  end

  private

  def after_roles_changed(current_user, user)
    gained_roles(user).each { |role| role_created_side_fx(role, user, current_user) }
    lost_roles(user).each { |role| role_destroyed_side_fx(role, user, current_user) }

    clean_initiative_assignees_for_user! user
  end

  def role_created_side_fx(role, user, current_user)
    new_project_moderator(role, user, current_user) if role['type'] == 'project_moderator'
    new_admin(user, current_user) if role['type'] == 'admin'
  end

  def new_admin(user, current_user)
    LogActivityJob
      .set(wait: 5.seconds)
      .perform_later(user, 'admin_rights_given', current_user, user.updated_at.to_i)
  end

  def new_project_moderator(role, user, current_user)
    LogActivityJob.set(wait: 5.seconds).perform_later(
      user, 'project_moderation_rights_given',
      current_user, Time.now.to_i,
      payload: { project_id: role['project_id'] }
    )
  end

  def role_destroyed_side_fx(role, user, current_user)
    project_moderator_destroyed(user, current_user) if role['type'] == 'project_moderator'
  end

  def project_moderator_destroyed(user, current_user)
    LogActivityJob.perform_later(user, 'project_moderation_rights_removed', current_user, Time.now.to_i)
  end

  def lost_roles(user)
    old_roles, new_roles = user.roles_previous_change
    old_roles.to_a - new_roles.to_a
  end

  def gained_roles(user)
    old_roles, new_roles = user.roles_previous_change
    new_roles.to_a - old_roles.to_a
  end

  def clean_initiative_assignees_for_user!(user)
    return if UserRoleService.new.can_moderate_initiatives?(user)

    user.assigned_initiatives.update_all(assignee_id: nil)
  end
end

::SideFxUserService.prepend UserConfirmation::Patches::SideFxUserService
