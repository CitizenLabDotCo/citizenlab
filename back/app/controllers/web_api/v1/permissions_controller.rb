# frozen_string_literal: true

class WebApi::V1::PermissionsController < ApplicationController
  before_action :set_permission, only: %i[show update requirements schema]
  skip_before_action :authenticate_user

  def index
    @permissions = policy_scope(Permission)
      .where(permission_scope: permission_scope)
      .filter_enabled_actions(permission_scope)
      .order_by_action(permission_scope)
    @permissions = paginate @permissions
    @permissions = @permissions.includes(:permission_scope, :custom_fields, permissions_custom_fields: [:custom_field])

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

  def requirements
    authorize @permission
    json_requirements = user_requirements_service.requirements @permission, current_user
    render json: raw_json({ requirements: json_requirements }), status: :ok
  end

  def schema
    authorize @permission
    fields = user_requirements_service.requirements_fields @permission
    render json: raw_json(JsonFormsService.new.user_ui_and_json_multiloc_schemas(fields))
  end

  private

  def serialize(permission)
    WebApi::V1::PermissionSerializer.new(
      permission,
      params: jsonapi_serializer_params,
      include: %i[permissions_custom_fields custom_fields]
    ).serializable_hash
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
    params.require(:permission).permit(:permitted_by, :global_custom_fields, group_ids: [])
  end
end
