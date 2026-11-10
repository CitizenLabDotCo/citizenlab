module CommonGround
  class ResultsService
    # thresholds for the consensus score
    HIGHEST_CONSENSUS_MIN_SCORE = 0.75 # e.g. at least 75/25 in one direction
    CLOSE_CALL_MAX_SCORE = 0.6         # e.g. between 40/60 and 60/40

    # agreement buckets, by the percentage of reactions that agree
    AGREE_MIN_PERCENT = 60
    DISAGREE_MAX_PERCENT = 40 # exclusive

    # @param [Boolean] exclude_admins_and_moderators Leave out the reactions of users
    #   with an admin or moderator role. Reactions without a known user are kept.
    def initialize(phase, exclude_admins_and_moderators: false)
      CommonGround::Utils.check_common_ground!(phase)

      @phase = phase
      @exclude_admins_and_moderators = exclude_admins_and_moderators
    end

    # @param [Integer] num_ideas Max number of ideas per top list; the full list is not limited
    def results(num_ideas = 5)
      Results.new(
        phase_id: @phase.id,
        top_consensus_ideas: top_consensus_ideas(num_ideas, min_score: HIGHEST_CONSENSUS_MIN_SCORE),
        top_controversial_ideas: top_consensus_ideas(num_ideas, reverse: true, max_score: CLOSE_CALL_MAX_SCORE),
        ideas_by_agreement: ideas_by_agreement,
        stats: stats
      )
    end

    # @param [Array<String>] agreements Any of 'agree', 'split' and 'disagree'
    # @return [ActiveRecord::Relation] The ids of the reacted ideas in those buckets, as a subquery
    def idea_ids_with_agreement(agreements)
      ideas_with_reaction_counts
        .where("#{agreement_sql} IN (?)", Array(agreements))
        .reselect('ideas.id')
    end

    private

    REACTION_COUNT_COLUMNS = %w[likes_count dislikes_count neutral_reactions_count].freeze

    def top_consensus_ideas(n, reverse: false, min_score: nil, max_score: nil)
      query = ideas_with_reaction_counts
      query = query.where("#{consensus_score_sql} >= ?", min_score) if min_score
      query = query.where("#{consensus_score_sql} <= ?", max_score) if max_score

      query
        .order(reverse ? consensus_score_sql.asc : consensus_score_sql.desc, votes_count_sql.desc, :id)
        .limit(n)
    end

    # Ties break on the vote margin, not on the vote count: that puts the best-backed statement
    # first among the agreed ones and last among the disagreed ones. The margin is always 0 on an
    # even split, so the vote count decides there.
    def ideas_by_agreement
      ideas_with_reaction_counts.order(
        net_agreement_sql.desc, vote_margin_sql.desc, votes_count_sql.desc, :id
      )
    end

    # The vote counts are computed from the (filtered) reactions rather than taken from the
    # counter caches on ideas, so that they respect exclude_admins_and_moderators. The returned ideas carry
    # the computed counts in place of their likes_count, dislikes_count and
    # neutral_reactions_count attributes.
    def ideas_with_reaction_counts
      idea_columns = (Idea.column_names - REACTION_COUNT_COLUMNS).map { |column| "ideas.#{column}" }
      reaction_count_columns = REACTION_COUNT_COLUMNS.map { |column| "reaction_counts.#{column}" }

      ideas
        .joins("INNER JOIN (#{reaction_counts_by_idea.to_sql}) reaction_counts ON reaction_counts.idea_id = ideas.id")
        .select(*idea_columns, *reaction_count_columns, "#{agreement_sql} AS agreement")
        .where('reaction_counts.likes_count + reaction_counts.dislikes_count > 0')
    end

    # Buckets an idea by the share of all its reactions, neutral ones included, that agree,
    # rounded to a whole percent.
    def agreement_sql
      @agreement_sql ||= begin
        agree_percent = <<~SQL.squish
          ROUND(reaction_counts.likes_count * 100.0 / NULLIF(
            reaction_counts.likes_count + reaction_counts.dislikes_count + reaction_counts.neutral_reactions_count, 0
          ))
        SQL

        Arel.sql(<<~SQL.squish)
          CASE
            WHEN #{agree_percent} >= #{AGREE_MIN_PERCENT} THEN 'agree'
            WHEN #{agree_percent} < #{DISAGREE_MAX_PERCENT} THEN 'disagree'
            ELSE 'split'
          END
        SQL
      end
    end

    # Runs from 1 (everyone who took a side agreed with each other) to 0.5 (a perfect split).
    # NULLIF guards the division: this fragment also lands in a WHERE clause, and Postgres does not
    # guarantee that the "took a side" filter of ideas_with_reaction_counts is evaluated first.
    def consensus_score_sql
      @consensus_score_sql ||= Arel.sql(<<~SQL.squish)
        greatest(reaction_counts.likes_count, reaction_counts.dislikes_count) * 1.0
        / NULLIF(#{votes_count_sql}, 0)
      SQL
    end

    # Runs from +1 (everyone who took a side agreed) to -1 (everyone disagreed).
    def net_agreement_sql
      @net_agreement_sql ||= Arel.sql("#{vote_margin_sql} * 1.0 / NULLIF(#{votes_count_sql}, 0)")
    end

    # How many more participants agreed than disagreed. Negative the other way round.
    def vote_margin_sql
      @vote_margin_sql ||= Arel.sql('(reaction_counts.likes_count - reaction_counts.dislikes_count)')
    end

    # The number of participants who took a side. Neutral votes are left out.
    def votes_count_sql
      @votes_count_sql ||= Arel.sql('(reaction_counts.likes_count + reaction_counts.dislikes_count)')
    end

    def reaction_counts_by_idea
      reactions
        .group(:reactable_id)
        .select(
          'reactions.reactable_id AS idea_id',
          "COUNT(*) FILTER (WHERE reactions.mode = 'up') AS likes_count",
          "COUNT(*) FILTER (WHERE reactions.mode = 'down') AS dislikes_count",
          "COUNT(*) FILTER (WHERE reactions.mode = 'neutral') AS neutral_reactions_count"
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
      return reactions unless @exclude_admins_and_moderators

      StatisticsRoleExclusion.new.exclude_admin_and_moderator_records(reactions, :user_id)
    end

    def num_participants
      reactions.select(:user_id).distinct.count
    end

    Results = Struct.new(
      :phase_id, :top_consensus_ideas, :top_controversial_ideas, :ideas_by_agreement, :stats,
      keyword_init: true
    )
  end
end
