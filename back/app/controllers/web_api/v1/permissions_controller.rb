# frozen_string_literal: true

class WebApi::V1::PermissionsController < ApplicationController
  before_action :set_permission, only: %i[show update participation_conditions requirements]
  skip_before_action :authenticate_user

  def index
    @permissions = policy_scope(Permission)
      .includes(:permission_scope)
      .where(permission_scope: permission_scope)
      .order(created_at: :desc)
    @permissions = paginate @permissions

    render json: linked_json(@permissions, WebApi::V1::PermissionSerializer, params: fastjson_params)
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
    render json: @permission.participation_conditions, status: :ok
  end

  def requirements
    authorize @permission
    json_requirements = PermissionsService.new.requirements @permission, current_user
    render json: json_requirements, status: :ok # TODO: use raw_json
  end

  private

  def serialize(permission)
    WebApi::V1::PermissionSerializer.new(permission, params: fastjson_params).serialized_json
  end

  def set_permission
    @permission = authorize Permission.find_by!(action: permission_action, permission_scope: permission_scope)
  end

  def permission_scope
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
    params[:permission_action]
  end

  def permission_params
    params.require(:permission).permit(:permitted_by, group_ids: [])
  end
end
