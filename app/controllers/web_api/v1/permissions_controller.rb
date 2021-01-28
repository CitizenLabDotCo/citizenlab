class WebApi::V1::PermissionsController < ApplicationController
  before_action :set_permission, only: [:show, :update, :participation_conditions]

  def index
    @permissions = policy_scope(Permission)
      .where(permission_scope_id: params[params[:parent_param]])
      .order(created_at: :desc)
      
    @permissions = @permissions
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: linked_json(@permissions, WebApi::V1::PermissionSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::PermissionSerializer.new(@permission, params: fastjson_params).serialized_json
  end

  def update
    @permission.assign_attributes permission_params
    authorize @permission
    # SideFxPermissionService.new.before_update(@permission, current_user)
    if @permission.save
      # SideFxPermissionService.new.after_update(@permission, current_user)
      render json: WebApi::V1::PermissionSerializer.new(
        @permission, 
        params: fastjson_params
        ).serialized_json, status: :ok
    else
      render json: { errors: @permission.errors.details }, status: :unprocessable_entity
    end
  end

  def participation_conditions
    render json: @permission.participation_conditions, status: :ok
  end


  private

  def set_permission
    @permission = Permission.find_by!(
      action: params[:permission_action],
      permission_scope_id: params[params[:parent_param]]
      )
    authorize @permission
  end

  def permission_params
    params.require(:permission).permit(
      :permitted_by,
      group_ids: []
    )
  end

  def secure_controller?
    false
  end
end
