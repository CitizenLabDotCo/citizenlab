class WebApi::V1::ProjectHolderOrderingsController < ::ApplicationController
  before_action :set_project_holder_ordering, only: [:reorder]

  def index
    @phos = policy_scope(ProjectHolderOrdering)
      .includes(:project_holder)
      .order(:ordering)

    @phos = @phos
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
    render json: linked_json(
      @phos, 
      WebApi::V1::ProjectHolderOrderingSerializer, 
      params: fastjson_params,
      include: [:project_holder]
      )
  end

  def reorder
    if @pho.insert_at(permitted_attributes(@pho)[:ordering])
      SideFxProjectHolderOrderingService.new.after_update(@pho, current_user)
      render json: WebApi::V1::ProjectHolderOrderingSerializer.new(
        @pho, 
        params: fastjson_params, 
        ).serialized_json, status: :ok
    else
      render json: {errors: @pho.errors.details}, status: :unprocessable_entity
    end
  end


  private

  def secure_controller?
    false
  end

  def set_project_holder_ordering
    @pho = ProjectHolderOrdering.find params[:id]
    authorize @pho
  end

end
