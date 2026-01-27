# frozen_string_literal: true

class WebApi::V1::IdeaExposuresController < ApplicationController
  skip_before_action :authenticate_user, only: %i[create]

  before_action :set_idea, only: %i[create]

  def create
    current_phase = TimelineService.new.current_phase(@idea.project)

    exposure = if current_user
      IdeaExposure.new(
        idea: @idea,
        user: current_user,
        phase: current_phase
      )
    else
      IdeaExposure.new(
        idea: @idea,
        visitor_hash: VisitorHashService.new.generate_for_request(request),
        phase: current_phase
      )
    end

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
