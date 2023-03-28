# frozen_string_literal: true

class WebApi::V1::PermissionsCustomFieldsController < ApplicationController
  skip_after_action :verify_policy_scoped

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
      permissions_custom_field,
      params: fastjson_params,
      include: %i[custom_field]
    ).serialized_json
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
      ).serialized_json, status: :created
    else
      render json: { errors: permissions_custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    permissions_custom_field.assign_attributes permission_params_for_update
    authorize permissions_custom_field
    SideFxPermissionsCustomFieldService.new.before_update permissions_custom_field, current_user
    if permissions_custom_field.save
      SideFxPermissionsCustomFieldService.new.before_update permissions_custom_field, current_user
      render json: WebApi::V1::PermissionsCustomFieldSerializer.new(
        permissions_custom_field,
        params: fastjson_params
      ).serialized_json, status: :ok
    else
      render json: { errors: permissions_custom_field.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxPermissionsCustomFieldService.new.before_destroy permissions_custom_field, current_user
    permissions_custom_field = permissions_custom_field.destroy
    if permissions_custom_field.destroyed?
      SideFxPermissionsCustomFieldService.new.after_destroy permissions_custom_field, current_user
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def permissions_custom_field
    # permissions_custom_field as method name does not work
    @permissions_custom_field ||= authorize PermissionsCustomField.find(params[:id])
  end

  def permission
    @permission ||= Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def permission_scope
    # TODO: avoid code duplication
    parent_param = params[:parent_param]
    scope_id = params[parent_param]
    case parent_param
    when nil
      nil
    when :project_id
      Project.find(scope_id)
    when :phase_id
      Phase.find(scope_id)
    when :idea_id
      idea = Idea.find(scope_id)
      ParticipationContextService.new.get_participation_context idea.project
    end
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
