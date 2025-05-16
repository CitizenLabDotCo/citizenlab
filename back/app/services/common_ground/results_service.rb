module CommonGround
  class ResultsService
    def initialize(phase)
      # TODO: check the phase type
      @phase = phase
    end

    # @param [Integer] n Number of ideas to return for each category
    def results(n = 5)
      Results.new(
        phase_id: @phase.id,
        top_consensus_ideas: top_consensus_ideas(n),
        top_controversial_ideas: top_controversial_ideas(n)
      )
    end

    private

    def top_consensus_ideas(n)
      @phase
        .ideas.published
        .where('likes_count + dislikes_count > 0')
        .order(Arel.sql('greatest(likes_count, dislikes_count) * 1.0 / (likes_count + dislikes_count) desc'))
        .limit(n)
    end

    def top_controversial_ideas(n)
      @phase.ideas.take(n)
    end

    Results = Struct.new(
      :phase_id, :top_consensus_ideas, :top_controversial_ideas,
      keyword_init: true
    )
  end
end
