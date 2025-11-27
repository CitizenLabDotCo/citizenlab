module Insights
  class VotingPhaseInsightsService < IdeationPhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        voting: participation_baskets,
        commenting_idea: participation_idea_comments
      }
    end

    def participation_baskets
      @phase.baskets.includes(:user, :baskets_ideas).map do |basket|
        total_votes = basket.baskets_ideas.to_a.sum(&:votes)

        {
          item_id: basket.id,
          action: 'voting',
          acted_at: basket.submitted_at,
          classname: 'Basket',
          participant_id: participant_id(basket.id, basket.user_id),
          user_custom_field_values: basket&.user&.custom_field_values || {},
          votes: total_votes
        }
      end
    end

    def phase_participation_method_metrics(participations)
      voting_participations = participations[:voting] || []
      online_votes = voting_participations.sum { |p| p[:votes] }
      online_votes_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.sum { |p| p[:votes] }
      offline_votes = @phase.manual_votes_count
      voters = voting_participations.pluck(:participant_id).uniq.count
      voters_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:participant_id).uniq.count
      comments_counts = phase_comments_counts(participations)

      {
        online_votes: online_votes,
        online_votes_last_7_days: online_votes_last_7_days,
        offline_votes: offline_votes,
        voters: voters,
        voters_last_7_days: voters_last_7_days,
        associated_ideas: associated_published_ideas_count,
        comments_posted: comments_counts[:total],
        comments_posted_last_7_days: comments_counts[:last_7_days]
      }
    end
  end
end
