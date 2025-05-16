module CommonGround
  class ResultsService
    def initialize(phase)
      # TODO: check the phase type
      @phase = phase
    end

    def results
      Results.new(
        phase_id: @phase.id,
        top_consensus_ideas: top_consensus_ideas,
        top_controversial_ideas: top_controversial_ideas
      )
    end

    private

    def top_consensus_ideas
      @phase.ideas.take(3)
    end

    def top_controversial_ideas
      @phase.ideas.take(3)
    end

    Results = Struct.new(
      :phase_id, :top_consensus_ideas, :top_controversial_ideas,
      keyword_init: true
    )
  end
end
