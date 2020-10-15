# frozen_string_literal: true

module Phases
  #
  # The Controller responsible for changing the ideas_order in a given @phase
  #
  class IdeasOrdersController < Phases::BaseController
    def update
      run_side_effect :before_update
      if @phase.update(phase_params)
        run_side_effect :after_update
        render json: serialized_phase, status: :ok
      else
        render json: serialized_phase_errors, status: :unprocessable_entity
      end
    end

    private

    # TODO: move to Rails Observer
    def run_side_effect(lifecycle_method)
      @run_side_effect ||= SideFxPhaseService.new.tap do |service|
        service.send(lifecycle_method, @phase, current_user)
      end
    end

    def phase_params
      params.require(:phase).permit(:ideas_order)
    end
  end
end
