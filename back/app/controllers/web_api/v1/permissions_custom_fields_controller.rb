# frozen_string_literal: true

class WebApi::V1::PermissionsCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  before_action :set_permissions_custom_field, only: %i[show]

  def index
    authorize PermissionsCustomField.new(permission: permission)

    permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new
    if permissions_custom_fields_service.verified_actions_enabled?
      # NEW non-paged version for verified actions with hidden locked fields
      permissions_custom_fields = permissions_custom_fields_service.fields_for_permission(permission, return_hidden: true)
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(permissions_custom_fields, params: jsonapi_serializer_params).serializable_hash
    else
      # Legacy version
      permissions_custom_fields = permission.permissions_custom_fields.order('custom_fields.ordering')
      permissions_custom_fields = paginate permissions_custom_fields
      permissions_custom_fields = permissions_custom_fields.includes(:custom_field)

      render json: linked_json(
        permissions_custom_fields,
        WebApi::V1::PermissionsCustomFieldSerializer,
        params: jsonapi_serializer_params,
        include: %i[custom_field]
      )
    end
  end

  def show
    render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
      @permissions_custom_field,
      params: jsonapi_serializer_params,
      include: %i[custom_field]
    ).serializable_hash
  end

  def create
    permissions_custom_field = PermissionsCustomField.new({ permission: permission }.merge(permission_params_for_create))
    authorize permissions_custom_field
    sidefx.before_create permissions_custom_field, current_user
    if permissions_custom_field.save
      sidefx.after_create permissions_custom_field, current_user
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
        permissions_custom_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: permissions_custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @permissions_custom_field = persist_and_find_permissions_custom_field
    @permissions_custom_field.assign_attributes permission_params_for_update
    authorize @permissions_custom_field
    sidefx.before_update @permissions_custom_field, current_user
    if @permissions_custom_field.save
      sidefx.after_update @permissions_custom_field, current_user
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
        @permissions_custom_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @permissions_custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    @permissions_custom_field = persist_and_find_permissions_custom_field
    authorize @permissions_custom_field

    if @permissions_custom_field.insert_at(permission_params_for_update[:ordering])
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
        @permissions_custom_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @permissions_custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @permissions_custom_field = persist_and_find_permissions_custom_field
    authorize @permissions_custom_field
    sidefx.before_destroy @permissions_custom_field, current_user
    permissions_custom_field = @permissions_custom_field.destroy
    if permissions_custom_field.destroyed?
      sidefx.after_destroy permissions_custom_field, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_permissions_custom_field
    @permissions_custom_field = authorize PermissionsCustomField.find(params[:id])
  end

  # Try and add default fields, then find the field specified in the newly persisted fields
  def persist_and_find_permissions_custom_field
    PermissionsCustomField.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    # Try and save the default fields, then find the field by custom_field_id in the persisted fields
    raise ActiveRecord::RecordNotFound unless permission_params_for_update[:permission_id] && permission_params_for_update[:custom_field_id]

    permission = Permission.find(permission_params_for_update[:permission_id])
    raise ActiveRecord::RecordNotFound unless permission

    Permissions::PermissionsCustomFieldsService.new.persist_default_fields permission
    field = permission.permissions_custom_fields.find_by(custom_field_id: permission_params_for_update[:custom_field_id])
    raise ActiveRecord::RecordNotFound unless field

    field
  end

  def permission
    @permission ||= Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def sidefx
    @sidefx ||= Permissions::SideFxPermissionsCustomFieldService.new
  end

  def permission_scope
    Permissions::PermissionsUpdateService.new.permission_scope_from_permissions_params(params)
  end

  def permission_action
    params[:permission_permission_action]
  end

  def permission_params_for_create
    params.require(:permissions_custom_field).permit(:required, :custom_field_id)
  end

  def permission_params_for_update
    params.require(:permissions_custom_field).permit(:required, :ordering, :permission_id, :custom_field_id)
  end
end
