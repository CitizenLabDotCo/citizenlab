# frozen_string_literal: true

class WebApi::V1::FeedbackPromptsController < ApplicationController
  before_action :set_feedback_prompt, only: %i[answer dismiss]

  def show_next
    authorize FeedbackPrompt
    errors = show_next_param_errors
    if errors.present?
      render json: { errors: errors }, status: :unprocessable_entity
      return
    end

    prompt = FeedbackPromptService.new.show_next(
      current_user,
      trigger: params[:trigger],
      ui_version: params[:ui_version],
      admin_area: admin_area_param,
      project_id: params[:project_id]
    )

    if prompt
      render json: serialize(prompt)
    else
      head :no_content
    end
  end

  def answer
    if @feedback_prompt.update(answer_params.merge(status: 'answered', responded_at: @feedback_prompt.responded_at || Time.zone.now))
      render json: serialize(@feedback_prompt)
    else
      render json: { errors: @feedback_prompt.errors.details }, status: :unprocessable_entity
    end
  end

  def dismiss
    @feedback_prompt.update!(status: 'dismissed', responded_at: Time.zone.now)
    render json: serialize(@feedback_prompt)
  end

  private

  def set_feedback_prompt
    @feedback_prompt = FeedbackPrompt.find(params[:id])
    authorize @feedback_prompt
  end

  # Checked upfront, since an invalid value would only fail once a due prompt is
  # being marked as shown.
  def show_next_param_errors
    errors = {}
    errors[:trigger] = [{ error: 'inclusion' }] unless FeedbackPrompt::TRIGGERS.include?(params[:trigger])
    errors[:ui_version] = [{ error: 'inclusion' }] unless FeedbackPrompt::UI_VERSIONS.include?(params[:ui_version])
    errors
  end

  def admin_area_param
    admin_area = params[:admin_area].to_s
    admin_area if FeedbackPrompt::ADMIN_AREAS.include?(admin_area)
  end

  def answer_params
    params.require(:feedback_prompt).permit(:score, :comment)
  end

  def serialize(prompt)
    WebApi::V1::FeedbackPromptSerializer.new(prompt, params: jsonapi_serializer_params).serializable_hash
  end
end
