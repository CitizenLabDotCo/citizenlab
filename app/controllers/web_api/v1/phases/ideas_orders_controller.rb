# frozen_string_literal: true

#
# The Controller responsible for changing the ideas_order in a given @phase
#
class WebApi::V1::Phases::IdeasOrdersController < WebApi::V1::Phases::BaseController
  def update
    run_side_effect :before_update
    if @phase.update(phase_params)
      run_side_effect :after_update
      render json: serialized_phase(params: phase_params.to_h), status: :ok
    else
      render json: serialized_phase_errors, status: :unprocessable_entity
    end
  end

  private

  # TODO: move to Rails Observer
  def run_side_effect(callback_name)
    @run_side_effect ||= SideFxPhaseService.new.tap do |service|
      service.send(callback_name, @phase, current_user)
    end
  end

  def phase_params
    params.require(:phase).permit(:ideas_order)
  end
end
