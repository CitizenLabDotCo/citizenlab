# frozen_string_literal: true

class WebApi::V1::PermissionsFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped
  before_action :set_permissions_field, only: %i[show]

  def index
    authorize PermissionsField.new(permission: permission)

    permissions_fields_service = Permissions::PermissionsFieldsService.new
    if permissions_fields_service.verified_actions_enabled?
      # NEW non-paged version for verified actions with hidden locked fields
      permissions_fields = permissions_fields_service.fields_for_permission(permission, return_related: true)
      render json: WebApi::V1::PermissionsFieldSerializer.new(permissions_fields, params: jsonapi_serializer_params).serializable_hash
    else
      # Legacy version
      permissions_fields = permission.permissions_fields.order('custom_fields.ordering')
      permissions_fields = paginate permissions_fields
      permissions_fields = permissions_fields.includes(:custom_field)

      render json: linked_json(
        permissions_fields,
        WebApi::V1::PermissionsFieldSerializer,
        params: jsonapi_serializer_params,
        include: %i[custom_field]
      )
    end
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
    sidefx.before_create permissions_field, current_user
    if permissions_field.save
      sidefx.after_create permissions_field, current_user
      render json: WebApi::V1::PermissionsFieldSerializer.new(
        permissions_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: permissions_field.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @permissions_field = persist_and_find_permission_field
    @permissions_field.assign_attributes permission_params_for_update
    authorize @permissions_field
    sidefx.before_update @permissions_field, current_user
    if @permissions_field.save
      sidefx.after_update @permissions_field, current_user
      render json: WebApi::V1::PermissionsFieldSerializer.new(
        @permissions_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @permissions_field.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    @permissions_field = persist_and_find_permission_field
    authorize @permissions_field
    @permissions_field.errors.add(:permissions_field, 'only field types of custom_field can be reordered') unless @permissions_field.can_be_reordered?

    if @permissions_field.can_be_reordered? && @permissions_field.insert_at(permission_params_for_update[:ordering])
      render json: WebApi::V1::PermissionsFieldSerializer.new(
        @permissions_field,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
    else
      render json: { errors: @permissions_field.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @permissions_field = persist_and_find_permission_field
    authorize @permissions_field
    sidefx.before_destroy @permissions_field, current_user
    permissions_field = @permissions_field.destroy
    if permissions_field.destroyed?
      sidefx.after_destroy permissions_field, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_permissions_field
    @permissions_field = authorize PermissionsField.find(params[:id])
  end

  # Try and add default fields, then find the field in the persisted fields
  # TODO: JS - merge with set_permission_field as that's only used for show now
  def persist_and_find_permission_field
    PermissionsField.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    # Try and save the default fields, then find the field by custom_field_id in the persisted fields
    raise ActiveRecord::RecordNotFound unless permission_params_for_update[:permission_id] && permission_params_for_update[:custom_field_id]

    permission = Permission.find(permission_params_for_update[:permission_id])
    raise ActiveRecord::RecordNotFound unless permission

    Permissions::PermissionsFieldsService.new.persist_default_fields permission
    field = permission.permissions_fields.find_by(custom_field_id: permission_params_for_update[:custom_field_id])
    raise ActiveRecord::RecordNotFound unless field

    field
  end

  def permission
    @permission ||= Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def sidefx
    @sidefx ||= Permissions::SideFxPermissionsFieldService.new
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
    params.require(:permissions_field).permit(:required, :ordering, :permission_id, :custom_field_id)
  end
end
