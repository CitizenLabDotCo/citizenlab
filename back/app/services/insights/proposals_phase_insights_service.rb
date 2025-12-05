module Insights
  class ProposalsPhaseInsightsService < IdeationPhaseInsightsService
    private

    def phase_participations
      {
        posting_idea: participations_posting_idea,
        commenting_idea: participations_commenting_idea,
        reacting_idea: participations_reacting_idea
      }
    end

    def participations_posting_idea
      end_time = @phase.end_at ? @phase.end_at.end_of_day : Time.current.end_of_day
      ideas = @phase.ideas
        .transitive(false)
        .where.not(submitted_at: nil)
        .where(<<~SQL.squish, @phase.start_at.beginning_of_day, end_time)
          ideas.created_at >= ? AND ideas.created_at <= ?
          AND ideas.publication_status IN ('published', 'submitted')
        SQL
        .includes(:author, :activities)

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.created_at,
          classname: 'Idea',
          threshold_reached_at: threshold_reached_at(idea),
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: idea&.author&.custom_field_values || {}
        }
      end
    end

    def phase_participation_method_metrics(participations)
      ideas_counts = phase_ideas_counts(participations[:posting_idea] || [])
      comments_counts = phase_comments_counts(participations)
      reactions_counts = phase_reactions_counts(participations)
      reached_threshold_counts = threshold_reached_counts(participations[:posting_idea] || [])

      {
        ideas_posted: ideas_counts[:total],
        ideas_posted_last_7_days: ideas_counts[:last_7_days],
        reached_threshold: reached_threshold_counts[:total],
        reached_threshold_last_7_days: reached_threshold_counts[:last_7_days],
        comments_posted: comments_counts[:total],
        comments_posted_last_7_days: comments_counts[:last_7_days],
        reactions: reactions_counts[:total],
        reactions_last_7_days: reactions_counts[:last_7_days]
      }
    end

    def threshold_reached_counts(posting_idea_participations)
      total = posting_idea_participations.count { |p| p[:threshold_reached_at].present? }
      last_7_days = posting_idea_participations.count do |p|
        p[:threshold_reached_at].present? &&
          p[:threshold_reached_at] >= 7.days.ago.beginning_of_day
      end

      { total: total, last_7_days: last_7_days }
    end

    # Because a proposal can be moved from a threshold_reached status to another status,
    # we ascertain when a proposal had a status of threshold_reached (if ever).
    # i.e. we include ideas with statuses of accepted, ineligible, etc,
    # if they ever had a status of threshold_reached.
    def threshold_reached_at(idea)
      activity = idea.activities.find do |act|
        act.action == 'changed_input_status' &&
          act.payload['input_status_to_code'] == 'threshold_reached'
      end

      activity&.acted_at
    end
  end
end
