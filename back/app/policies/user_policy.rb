# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin?
        scope.all
      elsif user && !user.normal_user?
        role_service = UserRoleService.new
        scope_for_moderator = scope.none
        projects = role_service.moderatable_projects user
        projects.each do |project|
          scope_for_moderator = scope_for_moderator.or role_service.moderators_for_project(project, scope)
        end
        scope_for_moderator.or scope.where(id: ParticipantsService.new.projects_participants(projects))
      else
        scope.none
      end
    end
  end

  def index?
    user&.active? && !user.normal_user?
  end

  def seats?
    user&.active? && !user.normal_user?
  end

  def index_xlsx?
    user&.active? && user.admin?
  end

  def create?
    app_config = AppConfiguration.instance
    (app_config.feature_activated?('password_login') && app_config.settings('password_login', 'enable_signup')) || (user&.active? && user.admin?)
  end

  def show?
    true
  end

  def by_slug?
    show?
  end

  def by_invite?
    record&.invite_pending?
  end

  def update?
    user&.active? && (record.id == user.id || user&.admin?)
  end

  def destroy?
    record.id == user&.id || (user&.active? && user.admin?)
  end

  def block?
    user&.active? && user.admin?
  end

  def unblock?
    user&.active? && user.admin?
  end

  def blocked_count?
    index?
  end

  def ideas_count?
    true
  end

  def comments_count?
    true
  end

  def update_password?
    user&.active? && (record.id == user.id)
  end

  def view_private_attributes?
    # When the policy was created with a class
    # instead of an instance, record is set to
    # that class.
    instance = if record.is_a? Class
      nil
    else
      record
    end
    !!((user && (instance&.id == user.id || user.admin?)) || instance&.invite_pending?)
  end

  def permitted_attributes_for_create
    permitted_attributes_for_update.tap do |attributes|
      attributes.delete(:avatar) unless AppConfiguration.instance.feature_activated?('user_avatars')
    end
  end

  def permitted_attributes_for_update
    # avatar is allowed even if the feature "user_avatars" is not activated to allow
    # users to remove their avatar.
    shared = [:email, :first_name, :last_name, :password, :avatar, :locale, { onboarding: [:topics_and_areas], custom_field_values: allowed_custom_field_keys, bio_multiloc: CL2_SUPPORTED_LOCALES }]
    attributes = admin? ? shared + [roles: %i[type project_id project_folder_id project_reviewer]] : shared
    attributes - verification_service.locked_attributes(record) # locked attributes cannot be updated
  end

  private

  def allowed_custom_field_keys
    CustomFieldParamsService.new.custom_field_values_params allowed_custom_fields
  end

  def allowed_custom_fields
    CustomField.registration.not_hidden.where.not(key: locked_custom_fields)
  end

  def locked_custom_fields
    verification_service.locked_custom_fields(record)
  end

  def verification_service
    @verification_service ||= Verification::VerificationService.new
  end
end

UserPolicy.prepend(BulkImportIdeas::Patches::UserPolicy)
