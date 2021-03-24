# frozen_string_literal: true

class SideFxUserService
  include SideFxHelper

  def before_create(user, _current_user)
    if CustomField.with_resource_type('User').enabled.count.zero? && (user.invite_status != 'pending')
      user.registration_completed_at ||= Time.zone.now
    end

    # Hack to embed phone numbers in email
    app_config = AppConfiguration.instance
    if app_config.feature_activated?('password_login') && app_config.settings('password_login', 'phone')
      phone_service = PhoneService.new
      if phone_service.phone_or_email(user.email) == :phone
        pattern = app_config.settings('password_login', 'phone_email_pattern')
        user.email = pattern.gsub('__PHONE__', phone_service.normalize_phone(user.email))
      end
    end
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

    gained_roles(user).each { |role| gained_role_sidefx(current_user, role, user) }
    lost_roles(user).each { |role| lost_role_sidefx(current_user, role, user) }
  end

  def after_destroy(frozen_user, current_user)
    serialized_user = clean_time_attributes(frozen_user.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_user), 'deleted', current_user, Time.now.to_i, payload: { user: serialized_user })
    UpdateMemberCountJob.perform_later
  end

  private

  def lost_role_sidefx(_current_user, role, user)
    return unless role['type'] == 'admin'

    moderatable_projects = ProjectPolicy::Scope.new(user, Project).moderatable
    user.default_assigned_projects
        .where.not(id: moderatable_projects)
        .update_all(default_assignee_id: nil, updated_at: DateTime.now)
    user.assigned_ideas
        .where.not(project: moderatable_projects)
        .update_all(assignee_id: nil, updated_at: DateTime.now)
    user.assigned_initiatives
        .update_all(assignee_id: nil, updated_at: DateTime.now)
  end

  def gained_role_sidefx(current_user, role, user)
    return unless role['type'] == 'admin'

    LogActivityJob.set(wait: 5.seconds).perform_later(user, 'admin_rights_given', current_user, user.updated_at.to_i)
  end

  def lost_roles(user)
    if user.roles_previously_changed?
      old_roles, new_roles = user.roles_previous_change
      (old_roles || []) - new_roles
    else
      []
    end
  end

  def gained_roles(user)
    if user.roles_previously_changed?
      old_roles, new_roles = user.roles_previous_change
      new_roles - (old_roles || [])
    else
      []
    end
  end
end

SideFxUserService.prepend_if_ee('ProjectPermissions::Patches::SideFxUserService')
