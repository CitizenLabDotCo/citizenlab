module Insights
  class IdeationPhaseInsightsService < BasePhaseInsightsService
    private

    def participations
      @participations = {
        posting_idea: participation_ideas_published,
        commenting_idea: participation_idea_comments,
        reacting_idea: participation_idea_reactions
      }
    end

    def participation_ideas_published
      end_time = @phase.end_at ? @phase.end_at.end_of_day : Time.current.end_of_day
      ideas = @phase.ideas
        .transitive
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

    def participation_idea_comments
      end_time = @phase.end_at ? @phase.end_at.end_of_day : Time.current.end_of_day
      comments = Comment.joins(:idea)
        .merge(@phase.ideas)
        .where(<<~SQL.squish, @phase.start_at.beginning_of_day, end_time)
          comments.created_at >= ? AND comments.created_at <= ?
          AND comments.publication_status = 'published'
        SQL
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

    def participation_idea_reactions
      end_time = @phase.end_at ? @phase.end_at.end_of_day : Time.current.end_of_day
      reactions = Reaction.where(
        reactable_type: 'Idea',
        reactable_id: @phase.ideas.select(:id),
        created_at: @phase.start_at.beginning_of_day..end_time
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

    def participation_method_metrics
      ideas_counts = phase_ideas_counts(@participations[:posting_idea] || [])
      comments_counts = phase_comments_counts(@participations)
      reactions_counts = phase_reactions_counts(@participations)

      @participation_method_metrics = {
        ideas_posted: ideas_counts[:total],
        ideas_posted_last_7_days: ideas_counts[:last_7_days],
        comments_posted: comments_counts[:total],
        comments_posted_last_7_days: comments_counts[:last_7_days],
        reactions: reactions_counts[:total],
        reactions_last_7_days: reactions_counts[:last_7_days]
      }
    end
  end
end
