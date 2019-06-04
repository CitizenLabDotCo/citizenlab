class WebApi::V1::OfficialFeedbackController < ApplicationController
  before_action :set_feedback_item_type_id_and_policy, only: [:index, :create]
  before_action :set_feedback, only: [:show, :update, :destroy]

  def index
    @feedbacks = policy_scope(OfficialFeedback, policy_scope_class: @policy_class::Scope)
      .where(feedback_item_type: @feedback_item_type, feedback_item_id: @feedback_item_id)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(created_at: :desc)

    render json: @feedbacks
  end

  def show
    render json: @feedback
  end

  def create
    @feedback = OfficialFeedback.new official_feedback_params
    @feedback.feedback_item_type = @feedback_item_type
    @feedback.feedback_item_id = @feedback_item_id
    @feedback.user ||= current_user
    authorize @feedback, policy_class: @policy_class
    SideFxOfficialFeedbackService.new.before_create @feedback, current_user
    if @feedback.save
      SideFxOfficialFeedbackService.new.after_create @feedback, current_user
      render json: @feedback, status: :created
    else
      render json: { errors: @feedback.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    authorize @feedback, policy_class: @policy_class
    @feedback.assign_attributes official_feedback_params
    authorize @feedback, policy_class: @policy_class
    SideFxOfficialFeedbackService.new.before_update @feedback, current_user
    if @feedback.save
      SideFxOfficialFeedbackService.new.after_update @feedback, current_user
      render json: @feedback, status: :ok
    else
      render json: { errors: @feedback.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxOfficialFeedbackService.new.before_destroy(@feedback, current_user)
    feedback = @feedback.destroy
    if feedback.destroyed?
      SideFxOfficialFeedbackService.new.after_destroy(feedback, current_user)
      head :ok
    else
      head 500
    end
  end

  private

  def set_feedback
    @feedback = OfficialFeedback.find_by(id: params[:id])
    @feedback_item_type = @feedback.feedback_item_type
    set_policy_class
    authorize @feedback, policy_class: @policy_class
  end

  def set_feedback_item_type_id_and_policy
    @feedback_item_type = params[:feedback_item]
    @feedback_item_id = params[:"#{@feedback_item_type.underscore}_id"]
    set_policy_class
  end

  def set_policy_class
    @policy_class = case @feedback_item_type
      when 'Idea' then IdeaOfficialFeedbackPolicy
      when 'Initiative' then InitiativeOfficialFeedbackPolicy
      else raise "#{@feedback_item_type} has no official feedback policy defined"
    end
    raise RuntimeError, "must not be blank" if @feedback_item_type.blank?
  end

  def official_feedback_params
    params.require(:official_feedback).permit(
      body_multiloc: CL2_SUPPORTED_LOCALES,
      author_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def secure_controller?
    false
  end

end
