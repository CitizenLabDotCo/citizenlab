# frozen_string_literal: true

class WebApi::V1::PermissionsController < ApplicationController
  before_action :set_permission, only: %i[show update reset requirements schema access_denied_explanation]
  skip_before_action :authenticate_user

  def index
    @permissions = policy_scope(Permission)
      .where(permission_scope: permission_scope)
      .filter_enabled_actions(permission_scope)
      .order_by_action(permission_scope)
    @permissions = paginate @permissions
    @permissions = @permissions.includes(:permission_scope, :custom_fields, :groups, permissions_custom_fields: [custom_field: [:options]])

    render json: linked_json(@permissions, WebApi::V1::PermissionSerializer, params: jsonapi_serializer_params, include: %i[permissions_custom_fields custom_fields])
  end

  def show
    render json: serialize(@permission)
  end

  def update
    @permission.assign_attributes(permission_params)
    authorize @permission
    if @permission.save
      render json: serialize(@permission), status: :ok
    else
      render json: { errors: @permission.errors.details }, status: :unprocessable_entity
    end
  end

  def reset
    authorize @permission
    ActiveRecord::Base.transaction do
      @permission.global_custom_fields = true
      if @permission.save
        @permission.permissions_custom_fields.destroy_all
        @permission.groups_permissions.destroy_all
        render json: serialize(@permission), status: :ok
      else
        render json: { errors: @permission.errors.details }, status: :unprocessable_entity
      end
    end
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

  def schema
    authorize @permission
    fields = user_requirements_service.requirements_custom_fields @permission
    render json: raw_json(user_ui_and_json_multiloc_schemas(fields))
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

  def user_ui_and_json_multiloc_schemas(fields)
    json_schemas = JsonFormsService.new.user_ui_and_json_multiloc_schemas(fields)
    mark_locked_json_forms_fields(json_schemas) if current_user
    json_schemas
  end

  def permissions_update_service
    @permissions_update_service ||= Permissions::PermissionsUpdateService.new
  end

  def user_requirements_service
    @user_requirements_service ||= Permissions::UserRequirementsService.new
  end

  def set_permission
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
      :verification_expiry,
      :everyone_tracking_enabled,
      group_ids: [],
      access_denied_explanation_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  # lock any fields locked by verification method(s)
  def mark_locked_json_forms_fields(schemas)
    locked_custom_fields = verification_service.locked_custom_fields(current_user).map(&:to_s)

    # Mark fields as locked & read only
    schemas[:ui_schema_multiloc].each_value do |ui_schema|
      ui_schema[:elements]
        .select { |e| locked_custom_fields.any? { |field| e[:scope].end_with?(field) } }
        .each_with_index do |element, index|
        ui_schema[:elements][index] = element.merge(options: element[:options].to_h.merge(readonly: true, verificationLocked: true))
      end
    end

    # Mark fields as required (if not already required)
    schemas[:json_schema_multiloc].each_value do |json_schema|
      json_schema[:required] = [] if json_schema[:required].nil?
      locked_custom_fields.each do |locked_field|
        json_schema[:required] << locked_field if json_schema[:required].exclude?(locked_field)
      end
    end
  end

  def verification_service
    @verification_service ||= Verification::VerificationService.new
  end
end

# WebApi::V1::PermissionsController.prepend(Verification::Patches::WebApi::V1::PermissionsController)
# frozen_string_literal: true
