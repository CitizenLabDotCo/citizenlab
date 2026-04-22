module Insights
  class IdeationPhaseInsightsService < BasePhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        posting_idea: participations_posting_idea,
        commenting_idea: participations_commenting_idea,
        reacting_idea: participations_reacting_idea
      }
    end

    def participations_posting_idea
      end_time = @phase.end_at || Time.current

      ideas = @phase.ideas
        .transitive
        .where.not(published_at: nil)
        .where(created_at: @phase.start_at...end_time, publication_status: 'published')
        .includes(:author)

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.created_at,
          classname: 'Idea',
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: parse_user_custom_field_values(idea, idea&.author)
        }
      end
    end

    def participations_commenting_idea
      end_time = @phase.end_at || Time.current

      comments = Comment.joins(:idea)
        .merge(@phase.ideas)
        .where(created_at: @phase.start_at...end_time, publication_status: 'published')
        .includes(:author)

      comments.map do |comment|
        {
          item_id: comment.id,
          action: 'commenting_idea',
          acted_at: comment.created_at,
          classname: 'Comment',
          participant_id: participant_id(comment.id, comment.author_id, comment.author_hash),
          user_custom_field_values: comment&.author&.custom_field_values || {}
        }
      end
    end

    def participations_reacting_idea
      end_time = @phase.end_at || Time.current

      reactions = Reaction.where(
        reactable_type: 'Idea',
        reactable_id: @phase.ideas,
        created_at: @phase.start_at...end_time
      ).includes(:user)

      reactions.map do |reaction|
        {
          item_id: reaction.id,
          action: 'reacting_idea',
          acted_at: reaction.created_at,
          classname: 'Reaction',
          participant_id: participant_id(reaction.id, reaction.user_id),
          user_custom_field_values: reaction&.user&.custom_field_values || {}
        }
      end
    end

    def phase_participation_method_metrics(participations)
      {
        ideas_posted: participations[:posting_idea].count,
        ideas_posted_7_day_percent_change: participations_7_day_change(participations[:posting_idea]),
        comments_posted: participations[:commenting_idea].count,
        comments_posted_7_day_percent_change: participations_7_day_change(participations[:commenting_idea]),
        reactions: participations[:reacting_idea].count,
        reactions_7_day_percent_change: participations_7_day_change(participations[:reacting_idea])
      }
    end
  end
end
