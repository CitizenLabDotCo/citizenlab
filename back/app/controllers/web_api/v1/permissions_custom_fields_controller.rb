# frozen_string_literal: true

class WebApi::V1::PermissionsCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  before_action :set_permissions_custom_field, only: %i[show]
  before_action :verify_permission_is_customised, only: %i[create update reorder destroy]

  def index
    authorize PermissionsCustomField.new(permission: permission)

    permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new
    permissions_custom_fields = permissions_custom_fields_service.fields_for_permission(permission, return_hidden: true)
    render json: WebApi::V1::PermissionsCustomFieldSerializer.new(permissions_custom_fields, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
      @permissions_custom_field,
      params: jsonapi_serializer_params,
      include: %i[custom_field]
    ).serializable_hash
  end

  def create
    raise ActiveRecord::RecordNotFound if permission.inherited?

    permissions_custom_field = PermissionsCustomField.new({ permission: permission }.merge(permission_params_for_create))
    authorize permissions_custom_field
    ActiveRecord::Base.transaction do
      sidefx.before_create permissions_custom_field, current_user
      save_or_raise!(permissions_custom_field)
      sidefx.after_create permissions_custom_field, current_user
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
        permissions_custom_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
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

  # The fields added by a group are not persisted (see
  # PermissionsCustomFieldsService#add_related_group_fields), so the id the
  # frontend holds for one belongs to no row yet and it has to be created here.
  def persist_and_find_permissions_custom_field
    field = PermissionsCustomField.find_by(id: params[:id])
    return field if field

    # We need permission_id and custom_field_id to create and find the field
    raise ActiveRecord::RecordNotFound unless permission_params_for_update[:permission_id] && permission_params_for_update[:custom_field_id]

    permission = Permission.find(permission_params_for_update[:permission_id])
    field = permission.permissions_custom_fields.find_by(custom_field_id: permission_params_for_update[:custom_field_id])

    if !field && permission_params_for_update[:ordering] && CustomField.find(permission_params_for_update[:custom_field_id])
      field = PermissionsCustomField.new({ permission: permission, custom_field_id: permission_params_for_update[:custom_field_id] })
      field.save
    end

    raise ActiveRecord::RecordNotFound unless field

    field
  end

  # Demographic questions are only editable once the permission has been
  # switched to 'custom'; on the other behaviors the persisted fields are not
  # what gets asked, so editing them would have no visible effect.
  def verify_permission_is_customised
    target = target_permission
    return unless target
    # Nothing can be persisted against an inherited permission at all, which the
    # action itself reports as a 404.
    return if target.inherited?

    require_feature!('permissions_custom_fields') unless action_name == 'destroy'
    return if target.custom_fields_behavior == 'custom'

    skip_authorization
    raise ApiError.new(:custom_fields_behavior_not_custom, status: 401)
  end

  # `create` is nested under the permission; the shallow routes identify it
  # through the field, or through the params when the field is one of the
  # non-persisted ones added by a group.
  def target_permission
    return permission if action_name == 'create'

    field = PermissionsCustomField.find_by(id: params[:id])
    return field.permission if field

    permission_id = params.dig(:permissions_custom_field, :permission_id)
    Permission.find_by(id: permission_id) if permission_id
  end

  # For a phase action that has not been overridden this is an unsaved copy of
  # the global 'visiting' permission: its (inherited) fields can be listed, but
  # nothing can be persisted against it.
  def permission
    @permission ||= begin
      found = Permissions::PermissionInheritanceService.new.find(permission_scope, permission_action)
      raise ActiveRecord::RecordNotFound unless found

      found
    end
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
