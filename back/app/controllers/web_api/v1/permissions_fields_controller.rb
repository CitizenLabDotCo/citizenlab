# frozen_string_literal: true

class WebApi::V1::PermissionsFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  before_action :set_permissions_field, only: %i[show update destroy]

  def index
    authorize PermissionsField.new(permission: permission)
    permissions_fields = permission.permissions_fields
    permissions_fields = paginate permissions_fields
    permissions_fields = permissions_fields.includes(:custom_field)

    render json: linked_json(
      permissions_fields,
      WebApi::V1::PermissionsFieldSerializer,
      params: jsonapi_serializer_params,
      include: %i[custom_field]
    )
  end

  def show
    render json: WebApi::V1::PermissionsFieldSerializer.new(
      @permissions_field,
      params: jsonapi_serializer_params,
      include: %i[custom_field]
    ).serializable_hash
  end

  def create
    permissions_field = PermissionsField.new({ permission: permission }.merge(permission_params_for_create))
    authorize permissions_field
    SideFxPermissionsFieldService.new.before_create permissions_field, current_user
    if permissions_field.save
      SideFxPermissionsFieldService.new.after_create permissions_field, current_user
      render json: WebApi::V1::PermissionsFieldSerializer.new(
        permissions_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: permissions_field.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @permissions_field.assign_attributes permission_params_for_update
    authorize @permissions_field
    SideFxPermissionsFieldService.new.before_update @permissions_field, current_user
    if @permissions_field.save
      SideFxPermissionsFieldService.new.before_update @permissions_field, current_user
      render json: WebApi::V1::PermissionsFieldSerializer.new(
        @permissions_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @permissions_field.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxPermissionsFieldService.new.before_destroy @permissions_field, current_user
    permissions_field = @permissions_field.destroy
    if permissions_field.destroyed?
      SideFxPermissionsFieldService.new.after_destroy permissions_field, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_permissions_field
    @permissions_field = authorize PermissionsField.find(params[:id])
  end

  def permission
    @permission ||= Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def permission_scope
    Permissions::PermissionsUpdateService.new.permission_scope_from_permissions_params(params)
  end

  def permission_action
    params[:permission_permission_action]
  end

  def permission_params_for_create
    params.require(:permissions_field).permit(:required, :custom_field_id)
  end

  def permission_params_for_update
    params.require(:permissions_field).permit(:required)
  end
end
