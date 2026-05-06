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
      end_time = @phase.end_at || Time.current

      ideas = @phase.ideas
        .transitive(false)
        .where.not(submitted_at: nil)
        .where(created_at: @phase.start_at...end_time, publication_status: %w[published submitted])
        .includes(:author)

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.created_at,
          classname: 'Idea',
          threshold_reached_at: threshold_reached_at(idea),
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: parse_user_custom_field_values(idea, idea&.author)
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
      threshold_reached_at_by_idea_id[idea.id]
    end

    # The legacy 'changed_input_status' branch covers activity rows logged before
    # TAN-7658, when automatic transitions emitted their own activity action.
    # Manual and (post-TAN-7658) automatic transitions both emit 'changed_status'.
    def threshold_reached_at_by_idea_id
      @threshold_reached_at_by_idea_id ||= begin
        idea_ids = @phase.ideas.pluck(:id)

        legacy = Activity
          .where(item_type: 'Idea', item_id: idea_ids, action: 'changed_input_status')
          .where("payload->>'input_status_to_code' = 'threshold_reached'")

        current = if threshold_reached_status_id
          Activity
            .where(item_type: 'Idea', item_id: idea_ids, action: 'changed_status')
            .where("payload->'change'->>1 = ?", threshold_reached_status_id)
        else
          Activity.none
        end

        (legacy.to_a + current.to_a)
          .group_by(&:item_id)
          .transform_values { |acts| acts.min_by(&:acted_at).acted_at }
      end
    end

    def threshold_reached_status_id
      @threshold_reached_status_id ||= IdeaStatus.find_by(
        code: 'threshold_reached',
        participation_method: 'proposals'
      )&.id
    end
  end
end
