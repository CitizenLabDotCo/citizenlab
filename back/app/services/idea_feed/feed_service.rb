module IdeaFeed
  class FeedService
    attr_reader :phase, :user

    def initialize(phase, user)
      @phase = phase
      @user = user
    end

    def top_n(n = 5, scope = Idea.all)
      eligible_ideas = fetch_eligible_ideas(scope)
      candidates = fetch_candidates_with_scores(eligible_ideas)
      candidates = Idea.from(candidates, :ideas)
        .order(Arel.sql('recency_score * 0.7 + engagement_score * 0.3 DESC'))

      candidates.limit(n)
    end

    private

    def fetch_candidates_with_scores(scope)
      scope.select("
        EXP(-EXTRACT(EPOCH FROM (NOW() - ideas.published_at)) / (30 * 86400)) as recency_score,
        (LN(1 + ideas.comments_count + ideas.likes_count * 0.5)) as engagement_score,
        ideas.*
      ")
    end

    def fetch_eligible_ideas(scope)
      exposed_ideas = IdeaExposure.where(user:, phase:).select(:idea_id).distinct

      scope
        .joins(:ideas_phases)
        .where(ideas_phases: { phase_id: phase.id })
        .published
        .where.not(id: exposed_ideas)
    end
  end
end
