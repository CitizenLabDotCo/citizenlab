# frozen_string_literal: true

class WebApi::V1::IdeaExposuresController < ApplicationController
  skip_before_action :authenticate_user, only: %i[create]

  before_action :set_idea, only: %i[create]

  def create
    phase = phase_for_exposure

    exposure = if current_user
      IdeaExposure.new(
        idea: @idea,
        user: current_user,
        phase: phase
      )
    else
      IdeaExposure.new(
        idea: @idea,
        visitor_hash: VisitorHashService.new.generate_for_request(request),
        phase: phase
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

  # The exposure must be recorded against the phase the feed is being browsed
  # in (passed as phase_id), so it matches what the feed endpoint filters on.
  # Falling back to the project's current phase keeps older clients working,
  # but that returns nil when no phase is active, so prefer the passed phase.
  def phase_for_exposure
    if params[:phase_id].present?
      @idea.phases.find(params[:phase_id])
    else
      TimelineService.new.current_phase(@idea.project)
    end
  end

  def set_idea
    @idea = Idea.find(params[:idea_id])
  end
end
