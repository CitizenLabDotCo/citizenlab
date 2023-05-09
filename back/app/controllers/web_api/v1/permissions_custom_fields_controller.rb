# frozen_string_literal: true

class WebApi::V1::PermissionsCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  before_action :set_permissions_custom_field, only: %i[show update destroy]

  def index
    authorize PermissionsCustomField.new(permission: permission)
    permissions_custom_fields = permission.permissions_custom_fields.includes(:custom_field)
    permissions_custom_fields = paginate permissions_custom_fields

    render json: linked_json(
      permissions_custom_fields,
      WebApi::V1::PermissionsCustomFieldSerializer,
      params: fastjson_params,
      include: %i[custom_field]
    )
  end

  def show
    render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
      @permissions_custom_field,
      params: fastjson_params,
      include: %i[custom_field]
    ).serializable_hash.to_json
  end

  def create
    permissions_custom_field = PermissionsCustomField.new({ permission: permission }.merge(permission_params_for_create))
    authorize permissions_custom_field
    SideFxPermissionsCustomFieldService.new.before_create permissions_custom_field, current_user
    if permissions_custom_field.save
      SideFxPermissionsCustomFieldService.new.after_create permissions_custom_field, current_user
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
        permissions_custom_field,
        params: fastjson_params
      ).serializable_hash.to_json, status: :created
    else
      render json: { errors: permissions_custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @permissions_custom_field.assign_attributes permission_params_for_update
    authorize @permissions_custom_field
    SideFxPermissionsCustomFieldService.new.before_update @permissions_custom_field, current_user
    if @permissions_custom_field.save
      SideFxPermissionsCustomFieldService.new.before_update @permissions_custom_field, current_user
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
        @permissions_custom_field,
        params: fastjson_params
      ).serializable_hash.to_json, status: :ok
    else
      render json: { errors: @permissions_custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxPermissionsCustomFieldService.new.before_destroy @permissions_custom_field, current_user
    permissions_custom_field = @permissions_custom_field.destroy
    if permissions_custom_field.destroyed?
      SideFxPermissionsCustomFieldService.new.after_destroy permissions_custom_field, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_permissions_custom_field
    @permissions_custom_field = authorize PermissionsCustomField.find(params[:id])
  end

  def permission
    @permission ||= Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def permission_scope
    PermissionsService.new.permission_scope_from_permissions_params(params)
  end

  def permission_action
    params[:permission_permission_action]
  end

  def permission_params_for_create
    params.require(:permissions_custom_field).permit(:required, :custom_field_id)
  end

  def permission_params_for_update
    params.require(:permissions_custom_field).permit(:required)
  end
end
