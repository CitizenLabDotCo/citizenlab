class WebApi::V1::PermissionsController < ApplicationController
  before_action :set_permission, only: %i[show update participation_conditions]
  skip_before_action :authenticate_user

  def index
    @permissions = policy_scope(Permission)
                   .includes(:permission_scope)
                   .where(permission_scope_id: permission_scope_id)
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

  private

  def serialize(permission)
    WebApi::V1::PermissionSerializer.new(permission, params: fastjson_params).serialized_json
  end

  def set_permission
    @permission = authorize Permission.find_by!(action: permission_action, permission_scope_id: permission_scope_id)
  end

  def permission_scope_id
    params[params[:parent_param]]
  end

  def permission_action
    params[:permission_action]
  end

  def permission_params
    params.require(:permission).permit(:permitted_by, group_ids: [])
  end
end
