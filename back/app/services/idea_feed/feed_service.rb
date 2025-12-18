module IdeaFeed
  class FeedService
    attr_reader :phase, :user, :topic_ids

    def initialize(phase, user, topic_ids: nil)
      @phase = phase
      @user = user
      @topic_ids = topic_ids
    end

    def top_n(n = 5, scope = Idea.all)
      eligible_ideas = fetch_eligible_ideas(scope)
      candidates = fetch_candidates_with_scores(eligible_ideas)
      candidates = Idea.from(candidates, :ideas)
        .order(Arel.sql('recency_score * 0.65 + engagement_score * 0.25 + wise_voice_score * 0.1 DESC'))
        .limit(n * 4)

      DiversityService.new.generate_list(candidates, IdeaExposure.where(user:, phase:), n)
    end

    def eligible_ideas_count(scope = Idea.all)
      fetch_eligible_ideas(scope).count
    end

    private

    def fetch_candidates_with_scores(scope)
      scope
        .left_joins(:wise_voice_flag)
        .select("
          EXP(-EXTRACT(EPOCH FROM (NOW() - ideas.published_at)) / (30 * 86400)) as recency_score,
          (LN(1 + ideas.comments_count + ideas.likes_count * 0.5)) as engagement_score,
          CASE WHEN wise_voice_flags.id IS NULL THEN 0 ELSE 1 END as wise_voice_score,
          ideas.*
        ")
    end

    def fetch_eligible_ideas(scope)
      exposed_ideas = IdeaExposure.where(user:, phase:).select(:idea_id).distinct

      scope = scope
        .joins(:ideas_phases)
        .where(ideas_phases: { phase_id: phase.id })
        .published
        .where.not(id: exposed_ideas)

      scope = scope.with_some_topics(topic_ids) if topic_ids.present?

      scope
    end
  end
end
