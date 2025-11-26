module Insights
  class ProposalsPhaseInsightsService < IdeationPhaseInsightsService
    private

    def phase_participations
      {
        posting_idea: participation_ideas_submitted,
        commenting_idea: participation_idea_comments,
        reacting_idea: participation_idea_reactions
      }
    end

    def participation_ideas_submitted
      end_time = @phase.end_at ? @phase.end_at.end_of_day : Time.current.end_of_day
      ideas = @phase.ideas
        .transitive(false)
        .where.not(submitted_at: nil)
        .where(<<~SQL.squish, @phase.start_at.beginning_of_day, end_time)
          ideas.created_at >= ? AND ideas.created_at <= ?
          AND ideas.publication_status IN ('published', 'submitted')
        SQL
        .includes(:author)

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.submitted_at, # analytics_fact_participations uses created_at, so maybe we should use that here too?
          classname: 'Idea',
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: idea&.author&.custom_field_values || {}
        }
      end
    end
  end
end
