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
        top_controversial_ideas: top_consensus_ideas(n, reverse: true),
        stats: stats
      )
    end

    private

    def top_consensus_ideas(n, reverse: false)
      order_sql = Arel.sql('greatest(likes_count, dislikes_count) * 1.0 / (likes_count + dislikes_count)')

      ideas
        .where('likes_count + dislikes_count > 0')
        .order(reverse ? order_sql.asc : order_sql.desc)
        .limit(n)
    end

    def stats
      {
        num_participants: num_participants,
        num_ideas: ideas.count,
        votes: { up: 0, down: 0, neutral: 0 }.merge(reactions.group(:mode).count.symbolize_keys)
      }
    end

    def ideas
      @phase.ideas.published
    end

    def reactions
      Reaction.where(reactable: ideas)
    end

    def num_participants
      reactions.select(:user_id).distinct.count
    end

    Results = Struct.new(
      :phase_id, :top_consensus_ideas, :top_controversial_ideas, :stats,
      keyword_init: true
    )
  end
end
