# frozen_string_literal: true

#
# The Controller responsible for changing the ideas_order in a given @phase
#
class WebApi::V1::Phases::IdeasOrdersController < WebApi::V1::Phases::BaseController
  def update
    @side_effects = SideFxPhaseService.new
    @side_effects.before_update(@phase, current_user)
    if @phase.update(phase_params)
      @side_effects.after_update(@phase, current_user)
      render json: serialized_phase(params: phase_params.to_h), status: :ok
    else
      render json: serialized_phase_errors, status: :unprocessable_entity
    end
  end

  private

  def phase_params
    params.require(:phase).permit(:ideas_order)
  end
end
