# frozen_string_literal: true

class WebApi::V1::PermissionsController < ApplicationController
  before_action :set_permission, only: %i[show update participation_conditions requirements schema]
  skip_before_action :authenticate_user

  def index
    @permissions = policy_scope(Permission)
      .includes(:permission_scope, :custom_fields, permissions_custom_fields: [:custom_field])
      .where(permission_scope: permission_scope)
      .order(created_at: :desc)
    @permissions = sort_permissions @permissions
    @permissions = paginate @permissions

    render json: linked_json(@permissions, WebApi::V1::PermissionSerializer, params: fastjson_params, include: %i[permissions_custom_fields custom_fields])
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

  def participation_conditions
    render json: raw_json({ participation_conditions: @permission.participation_conditions }), status: :ok
  end

  def requirements
    authorize @permission
    json_requirements = permissions_service.requirements @permission, current_user
    render json: raw_json({ requirements: json_requirements }), status: :ok
  end

  def schema
    authorize @permission
    fields = permissions_service.requirements_fields @permission
    render json: raw_json(JsonFormsService.new.user_ui_and_json_multiloc_schemas(fields))
  end

  private

  def sort_permissions(permissions)
    binding.pry
    permissions.sort_by do |permission|
      case permission.action
      when 'posting_idea'
        1
      when 'commenting_idea'
        2
      when 'voting_idea'
        3
      else
        4
      end
    end
  end

  def serialize(permission)
    WebApi::V1::PermissionSerializer.new(
      permission,
      params: fastjson_params,
      include: %i[permissions_custom_fields custom_fields]
    ).serialized_json
  end

  def permissions_service
    @permissions_service ||= PermissionsService.new
  end

  def set_permission
    @permission = authorize Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def permission_scope
    permissions_service.permission_scope_from_permissions_params(params)
  end

  def permission_action
    params[:permission_action]
  end

  def permission_params
    params.require(:permission).permit(:permitted_by, :global_custom_fields, group_ids: [])
  end
end
