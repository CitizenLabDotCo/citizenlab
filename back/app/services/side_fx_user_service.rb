# frozen_string_literal: true

class SideFxUserService
  include SideFxHelper

  def after_create(user, current_user)
    create_followers user
    TrackUserJob.perform_later(user)
    GenerateUserAvatarJob.perform_later(user)
    LogActivityJob.set(wait: 10.seconds).perform_later(user, 'created', user, user.created_at.to_i, payload: create_user_activity_payload(user))
    UpdateMemberCountJob.perform_later
    if user.admin?
      LogActivityJob.set(wait: 5.seconds).perform_later(user, 'admin_rights_given', current_user, user.created_at.to_i)
    end

    if user.registration_completed_at # For example, when a user is created via SSO
      LogActivityJob.perform_later(user, 'completed_registration', current_user, user.updated_at.to_i)
    end

    user.create_email_campaigns_unsubscription_token
    RequestConfirmationCodeJob.perform_now(user) if should_send_confirmation_email?(user)
    AdditionalSeatsIncrementer.increment_if_necessary(user, current_user) if user.roles_previously_changed?
  end

  def after_update(user, current_user)
    create_followers user
    TrackUserJob.perform_later(user)
    LogActivityJob.perform_later(user, 'changed', current_user, user.updated_at.to_i)
    if user.registration_completed_at_previously_changed?
      LogActivityJob.perform_later(user, 'completed_registration', current_user, user.updated_at.to_i)
    end
    after_roles_changed current_user, user if user.roles_previously_changed?

    AdditionalSeatsIncrementer.increment_if_necessary(user, current_user) if user.roles_previously_changed?

    UpdateMemberCountJob.perform_later
    RequestConfirmationCodeJob.perform_now(user) if should_send_confirmation_email?(user)
  end

  def after_destroy(frozen_user, current_user)
    activity_user = current_user&.id == frozen_user&.id ? nil : current_user
    LogActivityJob.perform_later(encode_frozen_resource(frozen_user), 'deleted', activity_user, Time.now.to_i)
    UpdateMemberCountJob.perform_later
    RemoveUserFromIntercomJob.perform_later(frozen_user.id)
    RemoveUsersFromSegmentJob.perform_later([frozen_user.id])
  end

  def after_block(user, current_user)
    TrackUserJob.perform_later(user)
    LogActivityJob.perform_later(
      user,
      'blocked',
      current_user,
      user.updated_at.to_i,
      payload: {
        block_reason: user.block_reason,
        block_start_at: user.block_start_at,
        block_end_at: user.block_end_at
      }
    )
    UserBlockedMailer.with(user: user).send_user_blocked_email.deliver_later
  end

  def after_unblock(user, current_user)
    TrackUserJob.perform_later(user)
    LogActivityJob.perform_later(user, 'unblocked', current_user, user.updated_at.to_i)
  end

  private

  def after_roles_changed(current_user, user)
    gained_roles(user).each { |role| role_created_side_fx(role, user, current_user) }
    lost_roles(user).each { |role| role_destroyed_side_fx(role, user, current_user) }
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

  def create_followers(user)
    area = Area.where(id: user.domicile).first
    Follower.find_or_create_by(followable: area, user: user) if area
  end

  def should_send_confirmation_email?(user)
    user.confirmation_required? && user.email_confirmation_code_sent_at.nil? &&
      (user.email.present? || user.new_email.present?) # some SSO methods don't provide email
  end

  def create_user_activity_payload(user)
    if user.sso?
      { flow: 'sso', method: user.identities.first&.provider }
    elsif user.password.nil?
      { flow: 'email_confirmation' }
    else
      { flow: 'email_password' }
    end
  end
end

SideFxUserService.prepend(IdeaAssignment::Patches::SideFxUserService)
SideFxUserService.prepend(Matomo::Patches::SideFxUserService)
SideFxUserService.prepend(PosthogIntegration::Patches::SideFxUserService)
