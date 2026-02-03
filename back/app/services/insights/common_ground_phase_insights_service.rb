module Insights
  class CommonGroundPhaseInsightsService < IdeationPhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        posting_idea: participations_posting_idea,
        reacting_idea: participations_reacting_idea
      }
    end

    def participations_posting_idea
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
          acted_at: idea.created_at,
          classname: 'Idea',
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          custom_field_values: parse_user_custom_field_values(idea, idea&.author)
        }
      end
    end

    def phase_participation_method_metrics(participations)
      {
        associated_ideas: associated_published_ideas_count,
        ideas_posted: participations[:posting_idea].count,
        ideas_posted_7_day_percent_change: participations_7_day_change(participations[:posting_idea]),
        reactions: participations[:reacting_idea].count,
        reactions_7_day_percent_change: participations_7_day_change(participations[:reacting_idea])
      }
    end
  end
end
