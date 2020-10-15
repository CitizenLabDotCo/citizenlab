# frozen_string_literal: true

#
# The base controller of all Phase child Controllers.
#
class WebApi::V1::Phases::BaseController < ApplicationController
  before_action :set_phase

  private

  def set_phase
    @phase = Phase.find(params[:phase_id])
    authorize @phase
  end

  def serialized_phase(**options)
    WebApi::V1::PhaseSerializer.new(@phase, params: fastjson_params, **options).serialized_json
  end

  def serialized_phase_errors
    { errors: @phase.errors.details }
  end
end
