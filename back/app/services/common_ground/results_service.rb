module CommonGround
  class ResultsService
    # @param [String] exclude_roles 'exclude_admins_and_moderators' to leave out the reactions of users
    #   with an admin or moderator role. Reactions without a known user are kept.
    def initialize(phase, exclude_roles: nil)
      CommonGround::Utils.check_common_ground!(phase)

      @phase = phase
      @exclude_roles = exclude_roles
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

    # The vote counts are computed from the (filtered) reactions rather than taken from the
    # counter caches on ideas, so that they respect exclude_roles. The returned ideas carry
    # them as up_count, down_count and neutral_count attributes.
    def top_consensus_ideas(n, reverse: false)
      consensus_score_sql = Arel.sql('greatest(reaction_counts.up_count, reaction_counts.down_count) * 1.0 / (reaction_counts.up_count + reaction_counts.down_count)')
      # The votes counts (excluding neutral votes) are used to break ties.
      votes_count_sql = Arel.sql('(reaction_counts.up_count + reaction_counts.down_count)')

      ideas
        .joins("INNER JOIN (#{reaction_counts_by_idea.to_sql}) reaction_counts ON reaction_counts.idea_id = ideas.id")
        .select('ideas.*', 'reaction_counts.up_count', 'reaction_counts.down_count', 'reaction_counts.neutral_count')
        .where('reaction_counts.up_count + reaction_counts.down_count > 0')
        .order(reverse ? consensus_score_sql.asc : consensus_score_sql.desc, votes_count_sql.desc)
        .limit(n)
    end

    def reaction_counts_by_idea
      reactions
        .group(:reactable_id)
        .select(
          'reactions.reactable_id AS idea_id',
          "COUNT(*) FILTER (WHERE reactions.mode = 'up') AS up_count",
          "COUNT(*) FILTER (WHERE reactions.mode = 'down') AS down_count",
          "COUNT(*) FILTER (WHERE reactions.mode = 'neutral') AS neutral_count"
        )
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
      reactions = Reaction.where(reactable: ideas)
      return reactions unless @exclude_roles == 'exclude_admins_and_moderators'

      reactions
        .where(user_id: nil)
        .or(reactions.where.not(user_id: User.not_normal_user.select(:id)))
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
