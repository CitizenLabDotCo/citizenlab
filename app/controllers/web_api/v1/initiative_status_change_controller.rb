class WebApi::V1::InitiativeStatusChangeController < ApplicationController
  before_action :set_initiative, only: [:index, :create]
  before_action :set_change, only: [:show]

  def index
    @feedbacks = policy_scope(OfficialFeedback, policy_scope_class: @policy_class::Scope)
      .where(post_type: @post_type, post_id: @post_id)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(created_at: :desc)

    render json: linked_json(@feedbacks, WebApi::V1::OfficialFeedbackSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::InitiativeStatusChangeSerializer.new(
      @change, 
      params: fastjson_params
      ).serialized_json
  end

  def create
    @feedback = OfficialFeedback.new official_feedback_params
    @feedback.post_type = @post_type
    @feedback.post_id = @post_id
    @feedback.user ||= current_user
    authorize @feedback, policy_class: @policy_class
    SideFxOfficialFeedbackService.new.before_create @feedback, current_user
    if @feedback.save
      SideFxOfficialFeedbackService.new.after_create @feedback, current_user
      render json: WebApi::V1::OfficialFeedbackSerializer.new(
        @feedback, 
        params: fastjson_params
        ).serialized_json, status: :created
    else
      render json: { errors: @feedback.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_change
    @change = InitiativeStatusChange.find params[:id]
    authorize @change
  end

  def set_initiative
    @initiative = Initiative.find(params[:initiative_id])
  end

  def status_change_params
    params.require(:initiative_status_change).permit(
      body_multiloc: CL2_SUPPORTED_LOCALES,
      author_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def secure_controller?
    false
  end

end
