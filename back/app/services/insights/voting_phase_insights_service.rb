module Insights
  class VotingPhaseInsightsService < IdeationPhaseInsightsService
    def votes_counts_with_user_custom_field_grouping(_custom_field_id = nil)
      # field = CustomField.find_by(id: custom_field_id)
      # return {} unless field

      # field_key = field.key

      # puts field.key.inspect

      # participations = cached_phase_participations
      # voting_participations = participations[:voting]

      { thing: 'value' }
    end

    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        voting: participations_voting,
        commenting_idea: participations_commenting_idea
      }
    end

    def participations_voting
      @phase.baskets.includes(:user, :baskets_ideas).map do |basket|
        basket_ideas = basket.baskets_ideas
        total_votes = basket_ideas.to_a.sum(&:votes)
        votes_per_idea = basket_ideas.to_h { |bi| [bi.idea_id, bi.votes] }

        {
          item_id: basket.id,
          action: 'voting',
          acted_at: basket.submitted_at,
          classname: 'Basket',
          participant_id: participant_id(basket.id, basket.user_id),
          user_custom_field_values: basket&.user&.custom_field_values || {},
          total_votes: total_votes,
          ideas_count: basket.ideas.count,
          votes_per_idea: votes_per_idea
        }
      end
    end

    def phase_participation_method_metrics(participations)
      common_7_day_changes = common_7_day_changes(participations)

      if @phase.voting_method == 'budgeting'
        {
          voting_method: 'budgeting',
          associated_ideas: associated_published_ideas_count,
          online_picks: participations[:voting].sum { |p| p[:ideas_count] },
          online_picks_7_day_change: online_picks_7_day_change(participations),
          offline_picks: @phase.manual_votes_count,
          voters: participations[:voting].pluck(:participant_id).uniq.count,
          voters_7_day_change: common_7_day_changes[:voters_7_day_change],
          comments_posted: participations[:commenting_idea].count,
          comments_posted_7_day_change: common_7_day_changes[:comments_posted_7_day_change]
        }
      else
        {
          voting_method: @phase.voting_method,
          associated_ideas: associated_published_ideas_count,
          online_votes: participations[:voting].sum { |p| p[:total_votes] },
          online_votes_7_day_change: online_votes_7_day_change(participations),
          offline_votes: @phase.manual_votes_count,
          voters: participations[:voting].pluck(:participant_id).uniq.count,
          voters_7_day_change: common_7_day_changes[:voters_7_day_change],
          comments_posted: participations[:commenting_idea].count,
          comments_posted_7_day_change: common_7_day_changes[:comments_posted_7_day_change]
        }
      end
    end

    def common_7_day_changes(participations)
      result = {
        voters_7_day_change: nil,
        comments_posted_7_day_change: nil
      }

      return result unless phase_has_run_more_than_14_days?

      voting_participations = participations[:voting]
      voters_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:participant_id).uniq.count
      voters_previous_7_days = voting_participations.select do |p|
        p[:acted_at] >= 14.days.ago && p[:acted_at] < 7.days.ago
      end.pluck(:participant_id).uniq.count

      commenting_ideas_participations = participations[:commenting_idea]
      comments_last_7_days = commenting_ideas_participations.count { |p| p[:acted_at] >= 7.days.ago }
      comments_previous_7_days = commenting_ideas_participations.count do |p|
        p[:acted_at] >= 14.days.ago && p[:acted_at] < 7.days.ago
      end

      result[:voters_7_day_change] = percentage_change(voters_previous_7_days, voters_last_7_days)
      result[:comments_posted_7_day_change] = percentage_change(comments_previous_7_days, comments_last_7_days)

      result
    end

    def online_picks_7_day_change(participations)
      return nil unless phase_has_run_more_than_14_days?

      voting_participations = participations[:voting]
      return 0.0 if voting_participations.empty?

      online_picks_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.sum { |p| p[:ideas_count] }
      picks_in_previous_7_days = voting_participations.select do |p|
        p[:acted_at] >= 14.days.ago && p[:acted_at] < 7.days.ago
      end
      online_picks_previous_7_days = picks_in_previous_7_days.sum { |p| p[:ideas_count] }

      percentage_change(online_picks_previous_7_days, online_picks_last_7_days)
    end

    def online_votes_7_day_change(participations)
      return nil unless phase_has_run_more_than_14_days?

      voting_participations = participations[:voting]
      return 0.0 if voting_participations.empty?

      online_votes_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.sum { |p| p[:total_votes] }
      votes_in_previous_7_days = voting_participations.select do |p|
        p[:acted_at] >= 14.days.ago && p[:acted_at] < 7.days.ago
      end
      online_votes_previous_7_days = votes_in_previous_7_days.sum { |p| p[:total_votes] }
      percentage_change(online_votes_previous_7_days, online_votes_last_7_days)
    end
  end
end
