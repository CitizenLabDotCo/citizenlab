module Insights
  class CommonGroundPhaseInsightsService < IdeationPhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        posting_idea: participation_ideas_published,
        reacting_idea: participation_idea_reactions
      }
    end

    def participation_ideas_published
      end_time = @phase.end_at ? @phase.end_at.end_of_day : Time.current.end_of_day
      ideas = @phase.ideas
        .transitive(false)
        .where.not(published_at: nil)
        .where(<<~SQL.squish, @phase.start_at.beginning_of_day, end_time)
          ideas.created_at >= ? AND ideas.created_at <= ?
          AND ideas.publication_status = 'published'
        SQL
        .includes(:author)

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.published_at, # analytics_fact_participations uses created_at, so maybe we should use that here too?
          classname: 'Idea',
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: idea&.author&.custom_field_values || {}
        }
      end
    end

    def phase_participation_method_metrics(participations)
      ideas_counts = phase_ideas_counts(participations[:posting_idea] || [])
      reactions_counts = phase_reactions_counts(participations)

      {
        associated_ideas: associated_published_ideas_count,
        ideas_posted: ideas_counts[:total],
        ideas_posted_last_7_days: ideas_counts[:last_7_days],
        reactions: reactions_counts[:total],
        reactions_last_7_days: reactions_counts[:last_7_days]
      }
    end
  end
end
