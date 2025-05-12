module CommonGround
  class ProgressService
    # @param [Phase] phase
    def initialize(phase)
      check_common_ground!(phase)

      @phase = phase
    end

    def user_progress(_user)
      Progress.new(
        phase_id: phase.id,
        num_ideas: phase.ideas.count,
        num_reacted_ideas: 0,
        next_idea: nil
      )
    end

    private

    attr_reader :phase

    def check_common_ground!(phase)
      unless phase.participation_method == ::ParticipationMethod::CommonGround.method_str
        raise UnsupportedPhaseError
      end
    end

    Progress = Struct.new(
      :phase_id, :num_ideas, :num_reacted_ideas, :next_idea,
      keyword_init: true
    ) do
      def next_idea_id = next_idea&.id
    end

    class UnsupportedPhaseError < StandardError; end
  end
end
