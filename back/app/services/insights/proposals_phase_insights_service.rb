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
          custom_field_values: parse_user_custom_field_values(idea, idea&.author)
        }
      end
    end

    def phase_participation_method_metrics(participations)
      proposals_reached_threshold = participations[:posting_idea].select { |p| p[:threshold_reached_at].present? }

      {
        ideas_posted: participations[:posting_idea].count,
        ideas_posted_7_day_percent_change: participations_7_day_change(participations[:posting_idea]),
        reached_threshold: proposals_reached_threshold.count,
        reached_threshold_7_day_percent_change: participations_7_day_change(proposals_reached_threshold),
        comments_posted: participations[:commenting_idea].count,
        comments_posted_7_day_percent_change: participations_7_day_change(participations[:commenting_idea]),
        reactions: participations[:reacting_idea].count,
        reactions_7_day_percent_change: participations_7_day_change(participations[:reacting_idea])
      }
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
