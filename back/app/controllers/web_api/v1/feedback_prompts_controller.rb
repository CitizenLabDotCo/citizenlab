# frozen_string_literal: true

class WebApi::V1::FeedbackPromptsController < ApplicationController
  before_action :set_feedback_prompt, only: %i[answer dismiss]

  def show_next
    authorize FeedbackPrompt
    ui_version = params.require(:ui_version)
    unless FeedbackPrompt::UI_VERSIONS.include?(ui_version)
      render json: { errors: { ui_version: [{ error: 'inclusion' }] } }, status: :unprocessable_entity
      return
    end

    prompt = FeedbackPromptService.new.show_next(current_user, ui_version: ui_version)

    if prompt
      render json: serialize(prompt)
    else
      head :no_content
    end
  end

  def answer
    if @feedback_prompt.update(answer_params.merge(status: 'answered'))
      render json: serialize(@feedback_prompt)
    else
      render json: { errors: @feedback_prompt.errors.details }, status: :unprocessable_entity
    end
  end

  def dismiss
    @feedback_prompt.update!(status: 'dismissed')
    render json: serialize(@feedback_prompt)
  end

  private

  def set_feedback_prompt
    @feedback_prompt = FeedbackPrompt.find(params[:id])
    authorize @feedback_prompt
  end

  def answer_params
    params.require(:feedback_prompt).permit(:score, :comment)
  end

  def serialize(prompt)
    WebApi::V1::FeedbackPromptSerializer.new(prompt, params: jsonapi_serializer_params).serializable_hash
  end
end
