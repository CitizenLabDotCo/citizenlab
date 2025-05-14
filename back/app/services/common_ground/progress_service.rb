module CommonGround
  class ProgressService
    # @param [Phase] phase
    def initialize(phase)
      check_common_ground!(phase)

      @phase = phase
    end

    def user_progress(user)
      Progress.new(
        phase_id: phase.id,
        num_ideas: ideas.count,
        num_reacted_ideas: reacted_ideas(user).count,
        next_idea: next_idea(user)
      )
    end

    private

    attr_reader :phase

    def check_common_ground!(phase)
      unless phase.participation_method == ::ParticipationMethod::CommonGround.method_str
        raise UnsupportedPhaseError
      end
    end

    def ideas
      phase.ideas.published
    end

    def reacted_ideas(user)
      ideas.joins(:reactions).where(reactions: { user: user })
    end

    def not_reacted_ideas(user)
      ideas.where.not(id: reacted_ideas(user))
    end

    def next_idea(user)
      # This isn't an efficient implementation, but it should be fine at our current scale.
      # It's not worth optimizing, since this is only temporary and will be replaced by a
      # smarter routing algorithm.
      not_reacted_ideas(user).order('random()').first
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
