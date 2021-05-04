# frozen_string_literal: true

class SideFxUserService
  include SideFxHelper

  def before_create(user, current_user)
    timestamp_registration(user)
  end

  def after_create(user, current_user)
    TrackUserJob.perform_later(user)
    GenerateUserAvatarJob.perform_later(user)
    LogActivityJob.set(wait: 10.seconds).perform_later(user, 'created', user, user.created_at.to_i)
    UpdateMemberCountJob.perform_later
    if user.registration_completed_at
      LogActivityJob.perform_later(user, 'completed_registration', user, user.created_at.to_i)
    end
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
    serialized_user = clean_time_attributes(frozen_user.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_user), 'deleted', current_user, Time.now.to_i,
                                 payload: { user: serialized_user })
    UpdateMemberCountJob.perform_later
  end

  private

  def timestamp_registration(user)
    return unless (CustomField.with_resource_type('User').enabled.count == 0) && (user.invite_status != 'pending')

    user.registration_completed_at ||= Time.now
  end

  def roles_side_fx(current_user, user)
    gained_roles(user).each { |role| role_created_side_fx(role, user, current_user) }
    lost_roles(user).each { |role| role_destroyed_side_fx(role, user, current_user) }
  end

  def role_created_side_fx(role, user, current_user)
    case role['type']
    when 'project_moderator' then new_project_moderator(role, user, current_user)
    when 'admin' then new_admin(user, current_user)
    end
  end

  def new_project_moderator(role, user, current_user)
    LogActivityJob.set(wait: 5.seconds).perform_later(
      user, 'project_moderation_rights_given',
      current_user, Time.now.to_i,
      payload: { project_id: role['project_id'] }
    )
  end

  def new_admin(user, current_user)
    LogActivityJob
      .set(wait: 5.seconds)
      .perform_later(user, 'admin_rights_given', current_user, user.updated_at.to_i)
  end

  def role_destroyed_side_fx(role, user, current_user)
    case role['type']
    when 'project_moderator' then project_moderator_destroyed(role, user, current_user)
    end
  end

  def project_moderator_destroyed(_role, user, current_user)
    LogActivityJob.perform_later(user, 'project_moderation_rights_removed', current_user, Time.now.to_i)
  end

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
