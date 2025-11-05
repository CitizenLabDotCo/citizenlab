# frozen_string_literal: true

class WebApi::V1::IdeasPhasesController < ApplicationController
  def show
    ideas_phase = IdeasPhase.find(params[:id])
    authorize ideas_phase

    render json: WebApi::V1::IdeasPhaseSerializer.new(
      ideas_phase,
      params: jsonapi_serializer_params
    ).serializable_hash, status: :ok
  end
end
