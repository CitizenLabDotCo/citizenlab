# frozen_string_literal: true

class WebApi::V1::IdeaExposuresController < ApplicationController
  before_action :set_idea, only: %i[create]

  def create
    current_phase = TimelineService.new.current_phase(@idea.project)
    exposure = IdeaExposure.new(
      idea: @idea,
      user: current_user,
      phase: current_phase
    )
    authorize exposure
    if exposure.save
      render json: WebApi::V1::IdeaExposureSerializer.new(
        exposure,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: exposure.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def set_idea
    @idea = Idea.find(params[:idea_id])
  end
end
