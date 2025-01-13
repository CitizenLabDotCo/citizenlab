# frozen_string_literal: true

class WebApi::V1::OfficialFeedbackController < ApplicationController
  before_action :set_feedback, only: %i[show update destroy]
  skip_before_action :authenticate_user

  def index
    @feedbacks = policy_scope(OfficialFeedback, policy_scope_class: OfficialFeedbackPolicy::Scope)
      .where(idea_id: params[:idea_id])
      .order(created_at: :desc)
    @feedbacks = paginate @feedbacks

    render json: linked_json(@feedbacks, WebApi::V1::OfficialFeedbackSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: WebApi::V1::OfficialFeedbackSerializer.new(
      @feedback,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create
    @feedback = OfficialFeedback.new official_feedback_params
    @feedback.idea_id = params[:idea_id]
    @feedback.user ||= current_user
    authorize @feedback
    SideFxOfficialFeedbackService.new.before_create @feedback, current_user
    if @feedback.save
      SideFxOfficialFeedbackService.new.after_create @feedback, current_user
      render json: WebApi::V1::OfficialFeedbackSerializer.new(
        @feedback,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @feedback.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    authorize @feedback
    @feedback.assign_attributes official_feedback_params
    authorize @feedback
    SideFxOfficialFeedbackService.new.before_update @feedback, current_user
    if @feedback.save
      SideFxOfficialFeedbackService.new.after_update @feedback, current_user
      render json: WebApi::V1::OfficialFeedbackSerializer.new(
        @feedback,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :ok
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
      head :internal_server_error
    end
  end

  private

  def set_feedback
    @feedback = OfficialFeedback.find params[:id]
    authorize @feedback
  end

  def official_feedback_params
    params.require(:official_feedback).permit(
      body_multiloc: CL2_SUPPORTED_LOCALES,
      author_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end

WebApi::V1::OfficialFeedbackController.include(AggressiveCaching::Patches::WebApi::V1::OfficialFeedbackController)
