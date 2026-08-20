# frozen_string_literal: true

class WebApi::V1::PermissionsController < ApplicationController
  include LockedUserCustomFieldsConcern

  before_action :set_permission, only: %i[show update requirements custom_fields custom_field_options access_denied_explanation]
  before_action :set_persisted_permission, only: %i[inherit]
  skip_before_action :authenticate_user
  # The list mixes persisted permissions with inherited ones, which have no row
  # to scope over; each is authorized individually instead.
  skip_after_action :verify_policy_scoped, only: :index

  def index
    permissions = inheritance_service.effective_permissions(permission_scope)
      .select { |permission| PermissionPolicy.new(current_user, permission).show? }
    @permissions = paginate Kaminari.paginate_array(permissions)

    render json: linked_json(@permissions, WebApi::V1::PermissionSerializer, params: jsonapi_serializer_params, include: %i[permissions_custom_fields custom_fields])
  end

  def show
    render json: serialize(@permission)
  end

  def update
    raise ActiveRecord::RecordNotFound if @permission.inherited?

    attributes = permission_params
    require_feature!('permissions_custom_fields') if attributes[:custom_fields_behavior] == 'custom'

    old_group_ids = @permission.group_ids
    @permission.assign_attributes(attributes)
    resolve_legacy_global_custom_fields(attributes)
    authorize @permission
    if @permission.save
      seed_custom_demographic_questions
      sidefx.after_update(@permission, current_user, old_group_ids)
      render json: serialize(@permission), status: :ok
    else
      render json: { errors: @permission.errors.details }, status: :unprocessable_entity
    end
  end

  # Detach the action from the global 'visiting' permission by persisting a copy
  # of it, so that it can be customised independently.
  def override
    permission = inheritance_service.find(permission_scope, permission_action)
    raise ActiveRecord::RecordNotFound unless permission

    authorize permission, :update?
    @permission = inheritance_service.override!(permission_scope, permission_action)
    sidefx.after_override(@permission, current_user)
    render json: serialize(@permission), status: :ok
  rescue Permissions::PermissionInheritanceService::NotInheritable
    raise ActiveRecord::RecordNotFound
  end

  # Put the action back under the global 'visiting' permission. Its own groups
  # and persisted demographic questions go with it.
  def inherit
    authorize @permission, :update?
    sidefx.before_inherit(@permission, current_user)
    @permission = inheritance_service.inherit!(@permission)
    render json: serialize(@permission), status: :ok
  rescue Permissions::PermissionInheritanceService::NotInheritable
    raise ActiveRecord::RecordNotFound
  end

  def requirements
    authorize @permission
    permissions_service = Permissions::BasePermissionsService.new(current_user, user_requirements_service: user_requirements_service)
    requirements = user_requirements_service.requirements @permission, current_user
    json_requirements = {
      permitted: user_requirements_service.permitted?(requirements),
      disabled_reason: permissions_service.denied_reason_for_action(permission_action, scope: permission_scope),
      requirements: requirements
    }
    render json: raw_json(json_requirements), status: :ok
  end

  def custom_fields
    authorize @permission
    fields = user_requirements_service.requirements_custom_fields @permission
    ActiveRecord::Associations::Preloader.new(records: fields, associations: [options: :image]).call
    render json: WebApi::V1::CustomFieldSerializer.new(
      fields,
      params: jsonapi_serializer_params_with_locked_fields,
      include: [:options]
    ).serializable_hash.to_json
  end

  def custom_field_options
    authorize @permission
    fields = user_requirements_service.requirements_custom_fields @permission
    options = CustomFieldOption
      .joins(:custom_field)
      .where(custom_field_id: fields.map(&:id))
      .order('custom_fields.ordering ASC, custom_field_options.ordering ASC')

    render json: WebApi::V1::CustomFieldOptionSerializer.new(
      options,
      params: jsonapi_serializer_params
    ).serializable_hash.to_json
  end

  def access_denied_explanation
    authorize @permission
    attributes = {
      access_denied_explanation_multiloc: @permission.access_denied_explanation_multiloc
    }
    render json: raw_json(attributes), status: :ok
  end

  private

  def serialize(permission)
    WebApi::V1::PermissionSerializer.new(
      permission,
      params: jsonapi_serializer_params,
      include: %i[permissions_custom_fields custom_fields]
    ).serializable_hash
  end

  def sidefx
    @sidefx ||= Permissions::SideFxPermissionService.new
  end

  # Gives a permission that has just been switched to 'custom' the platform's
  # demographic questions to start from. Only on the switch: a permission left
  # on 'custom' with no questions was emptied deliberately.
  def seed_custom_demographic_questions
    return unless @permission.saved_change_to_custom_fields_behavior?
    return unless @permission.custom_fields_behavior == 'custom'

    permissions_custom_fields_service.persist_default_fields(@permission)
  end

  # Clients that still send `global_custom_fields`, which `custom_fields_behavior`
  # replaces, get the behavior it stands for.
  def resolve_legacy_global_custom_fields(attributes)
    return unless attributes.key?(:global_custom_fields)
    return if attributes.key?(:custom_fields_behavior)

    @permission.custom_fields_behavior = Permissions::CustomFieldsBehaviorService.new.derive(@permission)
  end

  def permissions_custom_fields_service
    @permissions_custom_fields_service ||= Permissions::PermissionsCustomFieldsService.new
  end

  def permissions_update_service
    @permissions_update_service ||= Permissions::PermissionsUpdateService.new
  end

  def user_requirements_service
    @user_requirements_service ||= Permissions::UserRequirementsService.new
  end

  def inheritance_service
    @inheritance_service ||= Permissions::PermissionInheritanceService.new
  end

  # Resolves to the persisted permission, or — for an inheritable action that
  # has not been overridden — to an unsaved copy of the global 'visiting'
  # permission.
  def set_permission
    permission = inheritance_service.find(permission_scope, permission_action)
    raise ActiveRecord::RecordNotFound unless permission

    @permission = authorize permission
  end

  def set_persisted_permission
    @permission = authorize Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def permission_scope
    permissions_update_service.permission_scope_from_permissions_params(params)
  end

  def permission_action
    params[:permission_action]
  end

  def permission_params
    params.require(:permission).permit(
      :permitted_by,
      :global_custom_fields,
      :custom_fields_behavior,
      :verification_expiry,
      :everyone_tracking_enabled,
      :user_fields_in_form,
      :user_data_collection,
      :require_confirmed_email,
      :confirmed_email_expiry,
      :require_name,
      :require_password,
      :require_verification,
      :require_confirmed_phone_number,
      :confirmed_phone_number_expiry,
      group_ids: [],
      access_denied_explanation_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end

# WebApi::V1::PermissionsController.prepend(Verification::Patches::WebApi::V1::PermissionsController)
