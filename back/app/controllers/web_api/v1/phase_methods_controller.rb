# frozen_string_literal: true

class WebApi::V1::PhaseMethodsController < ApplicationController
  skip_before_action :authenticate_user
  before_action :set_phase, only: %i[index create]
  before_action :set_phase_method, only: %i[destroy]

  def index
    @phase_methods = policy_scope(PhaseMethod).where(phase_id: @phase.id).order(:start_at)
    render json: WebApi::V1::PhaseMethodSerializer.new(
      @phase_methods,
      params: jsonapi_serializer_params
    ).serializable_hash
  end

  def create
    @phase_method = @phase.phase_methods.new(phase_method_params)
    authorize @phase_method

    if @phase_method.save
      render json: WebApi::V1::PhaseMethodSerializer.new(
        @phase_method,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @phase_method.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @phase_method
    if @phase_method.destroy
      head :no_content
    else
      head :internal_server_error
    end
  end

  private

  def set_phase
    @phase = Phase.find(params[:phase_id])
  end

  def set_phase_method
    @phase_method = PhaseMethod.find(params[:id])
  end

  def phase_method_params
    params.require(:phase_method).permit(:method_type, :start_at, :end_at)
  end
end
