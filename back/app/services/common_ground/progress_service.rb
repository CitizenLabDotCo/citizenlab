module CommonGround
  class ProgressService
    # @param [Phase] phase
    def initialize(phase)
      check_common_ground!(phase)

      @phase = phase
    end

    def user_progress(_user)
      {}
    end

    private

    attr_reader :phase

    def check_common_ground!(phase)
      unless phase.participation_method == ::ParticipationMethod::CommonGround.method_str
        raise UnsupportedPhaseError
      end
    end

    class UnsupportedPhaseError < StandardError; end
  end
end
