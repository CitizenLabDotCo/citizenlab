# frozen_string_literal: true

module CommonGround
  module Errors
    class UnsupportedPhaseError < StandardError; end
  end

  module Utils
    module_function

    def check_common_ground!(phase)
      unless phase.participation_method == ::ParticipationMethod::CommonGround.method_str
        raise Errors::UnsupportedPhaseError
      end
    end
  end
end
