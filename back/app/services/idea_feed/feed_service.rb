module IdeaFeed
  class FeedService
    attr_reader :phase, :user, :visitor_hash

    def initialize(phase, user: nil, visitor_hash: nil)
      raise ArgumentError, 'Either user or visitor_hash must be provided' if user.nil? && visitor_hash.nil?

      @phase = phase
      @user = user
      @visitor_hash = visitor_hash
    end

    def top_n(n = 5, scope = Idea.all)
      eligible_ideas = fetch_eligible_ideas(scope)

      candidates = if eligible_ideas.none?
        fetch_least_exposed_candidates(fetch_all_ideas(scope), n * 4)
      else
        fetch_scored_candidates(eligible_ideas, n * 4)
      end

      if skip_diversity_sampling?
        candidates.limit(n).to_a
      else
        DiversityService.new.generate_list(candidates, exposures_scope, n)
      end
    end

    def eligible_ideas_count(scope = Idea.all)
      fetch_eligible_ideas(scope).count
    end

    private

    def exposures_scope
      if user
        IdeaExposure.where(user: user, phase: phase)
      else
        IdeaExposure.where(visitor_hash: visitor_hash, phase: phase)
      end
    end

    def fetch_scored_candidates(scope, limit)
      scored = scope
        .left_joins(:wise_voice_flag)
        .select("
          EXP(-EXTRACT(EPOCH FROM (NOW() - ideas.published_at)) / (30 * 86400)) as recency_score,
          (LN(1 + ideas.comments_count + ideas.likes_count * 0.5)) as engagement_score,
          CASE WHEN wise_voice_flags.id IS NULL THEN 0 ELSE 1 END as wise_voice_score,
          ideas.*
        ")

      Idea.from(scored, :ideas)
        .order(Arel.sql('recency_score * 0.65 + engagement_score * 0.25 + wise_voice_score * 0.1 DESC'))
        .limit(limit)
    end

    def fetch_least_exposed_candidates(scope, limit)
      exposure_counts_sql = exposures_scope
        .group(:idea_id)
        .select(:idea_id, 'COUNT(*) as exposure_count')
        .to_sql

      scope
        .joins("LEFT JOIN (#{exposure_counts_sql}) AS exposure_counts ON exposure_counts.idea_id = ideas.id")
        .order(Arel.sql('COALESCE(exposure_counts.exposure_count, 0) ASC'))
        .limit(limit)
    end

    # This is am exceptional performance optimization in case a platform is hit
    # pretty hard. Can be manually turned on.
    def skip_diversity_sampling?
      AppConfiguration.instance.settings('idea_feed', 'skip_diversity_sampling') == true
    end

    def fetch_eligible_ideas(scope)
      exposed_ideas = exposures_scope.select(:idea_id).distinct

      scope
        .joins(:ideas_phases)
        .where(ideas_phases: { phase_id: phase.id })
        .published
        .where.not(id: exposed_ideas)
    end

    def fetch_all_ideas(scope)
      scope
        .joins(:ideas_phases)
        .where(ideas_phases: { phase_id: phase.id })
        .published
    end
  end
end
