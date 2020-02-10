class WebApi::V1::ProjectHolderOrderingsController < ::ApplicationController
  before_action :set_project_holder_ordering, only: [:reorder]

  def index
    @phos = policy_scope(ProjectHolderOrdering)
      .includes(:project_holder)
      .order(:ordering)

    projects = Project.where(project_holder_ordering: @phos)
    if params[:filter_can_moderate]
      projects = projects.moderatable 
      @phos = @phos.where(project_holder: projects)
    end

    @phos = @phos
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    user_baskets = current_user&.baskets
      &.where(participation_context_type: 'Project')
      &.group_by do |basket|
        [basket.participation_context_id, basket.participation_context_type]
      end
    user_baskets ||= {}
    instance_options = {
      user_baskets: user_baskets,
      allocated_budgets: ParticipationContextService.new.allocated_budgets(projects),
      timeline_active: TimelineService.new.timeline_active_on_collection(projects)
    }

    render json: linked_json(
      @phos, 
      WebApi::V1::ProjectHolderOrderingSerializer, 
      params: fastjson_params(superhero: 'batman'),
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
