class WebApi::V1::ProjectHolderOrderingsController < ::ApplicationController
  before_action :set_project_holder_ordering, only: [:reorder]

  def index
    @phos = policy_scope(ProjectHolderOrdering)

    if (params.keys & %w(publication_statuses areas topics)).present?
      @phos = @phos.where(project_holder_type: 'ProjectFolder')
        .or(@phos.where(project_holder: ProjectsFilteringService.new.apply_common_index_filters(
          Pundit.policy_scope(current_user, Project), 
          params)))
    end

    @phos = @phos
      .order(:ordering)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@phos, WebApi::V1::ProjectHolderOrderingSerializer, params: fastjson_params)
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
