class WebApi::V1::PermissionsController < ApplicationController
  before_action :set_permission, only: [:show, :update]

  def index
    @permissions = policy_scope(Permission)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    @permissions = @permissions
      .where(permittable_id: params[params[:parent_param]])
      .order(created_at: :desc)
    render json: @permissions
  end

  def show
    render json: @permission
  end

  def update
    @permission.assign_attributes permission_params
    authorize @permission
    # SideFxPermissionService.new.before_update(@permission, current_user)
    if @permission.save
      # SideFxPermissionService.new.after_update(@permission, current_user)
      render json: @permission, status: :ok
    else
      render json: { errors: @permission.errors.details }, status: :unprocessable_entity
    end
  end


  private

  def set_permission
    @permission = Permission.find_by(
      action: params[:permission],
      permittable_id: params[params[:parent_param]]
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
