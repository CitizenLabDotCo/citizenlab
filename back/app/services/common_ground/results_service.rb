module CommonGround
  class ResultsService
    def initialize(phase)
      CommonGround::Utils.check_common_ground!(phase)

      @phase = phase
    end

    # @param [Integer] num_ideas Number of ideas to return for each category
    def results(num_ideas = 5)
      Results.new(
        phase_id: @phase.id,
        top_consensus_ideas: top_consensus_ideas(num_ideas),
        top_controversial_ideas: top_consensus_ideas(num_ideas, reverse: true),
        stats: stats
      )
    end

    private

    def top_consensus_ideas(n, reverse: false)
      consensus_score_sql = Arel.sql('greatest(likes_count, dislikes_count) * 1.0 / (likes_count + dislikes_count)')
      # The votes counts (excluding neutral votes) are used to break ties.
      votes_count_sql = Arel.sql('(likes_count + dislikes_count)')

      ideas
        .where('likes_count + dislikes_count > 0')
        .order(reverse ? consensus_score_sql.asc : consensus_score_sql.desc, votes_count_sql.desc)
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
