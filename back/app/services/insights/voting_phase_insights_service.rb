module Insights
  class VotingPhaseInsightsService < IdeationPhaseInsightsService
    def vote_counts_with_user_custom_field_grouping(custom_field = nil)
      participations = cached_phase_participations
      voting_participations = participations[:voting]
      offline_votes = @phase.manual_votes_count
      online_votes = if @phase.voting_method == 'budgeting'
        voting_participations.sum { |p| p[:ideas_count] }
      else
        voting_participations.sum { |p| p[:total_votes] }
      end

      total_votes = online_votes + offline_votes

      options = if custom_field&.options&.any?
        custom_field.options.index_by(&:key).transform_values do |opt|
          {
            title_multiloc: opt.title_multiloc,
            ordering: opt.ordering
          }
        end
      else
        {}
      end

      {
        online_votes: online_votes,
        offline_votes: offline_votes,
        total_votes: total_votes,
        group_by: custom_field&.key,
        custom_field_id: custom_field&.id,
        input_type: custom_field&.input_type,
        options: options,
        ideas: idea_vote_counts_data(voting_participations, custom_field, total_votes)
      }
    end

    private

    def ideas_ordered_by_total_votes
      vote_count_column = @phase.voting_method == 'budgeting' ? 'baskets_count' : 'votes_count'

      @phase.ideas.transitive.order(
        Arel.sql("COALESCE(ideas.#{vote_count_column}, 0) + COALESCE(ideas.manual_votes_amount, 0) DESC")
      )
    end

    def idea_vote_counts_data(voting_participations, field, total_phase_votes)
      idea_ids_to_user_custom_field_values = idea_ids_to_user_custom_field_values(voting_participations)
      ideas = ideas_ordered_by_total_votes

      ideas.map do |idea|
        online_votes = if @phase.voting_method == 'budgeting'
          idea&.baskets_count || 0
        else
          idea&.votes_count || 0
        end

        offline_votes = idea&.manual_votes_amount || 0
        total_votes = online_votes + offline_votes
        votes_demographics = if field.present?
          idea_votes_demographics(field, idea_ids_to_user_custom_field_values, idea, total_votes, offline_votes)
        end

        {
          id: idea.id,
          title_multiloc: idea.title_multiloc,
          online_votes: online_votes,
          offline_votes: offline_votes,
          total_votes: total_votes,
          percentage: a_as_percentage_of_b(total_votes, total_phase_votes),
          series: votes_demographics
        }
      end
    end

    # Because we are grouping/slicing by votes per demographic attribute (and for blank == no answer),
    # we need to duplicate the user_custom_field_values for each vote a user cast for that idea.
    # This handles mutliple voting phases correctly, but could/should be simplified for
    # single and budgeting voting phases.
    def idea_ids_to_user_custom_field_values(voting_participations)
      grouped_data = voting_participations.flat_map do |participation|
        participation[:votes_per_idea].flat_map do |idea_id, vote_count|
          # Duplicate the custom_field_values hash 'vote_count' times
          Array.new(vote_count) { [idea_id, participation[:custom_field_values]] }
        end
      end

      grouped_data.group_by(&:first).transform_values { |arr| arr.map(&:last) }
    end

    def idea_votes_demographics(field, idea_ids_to_user_custom_field_values, idea, total_votes, offline_votes)
      vote_custom_field_values = idea_ids_to_user_custom_field_values[idea.id] || []
      counts = if field.key == 'birthyear'
        birthyear_counts(vote_custom_field_values)
      else
        select_or_checkbox_counts_for_field(vote_custom_field_values, field)
      end

      counts['_blank'] ||= 0
      counts['_blank'] += offline_votes

      counts.transform_values do |count|
        {
          count: count,
          percentage: a_as_percentage_of_b(count, total_votes)
        }
      end
    end

    def birthyear_counts(vote_custom_field_values)
      age_stats = UserCustomFields::AgeStats.calculate(vote_custom_field_values)
      age_stats.format_in_ranges[:ranged_series]
    end

    def a_as_percentage_of_b(a, b)
      return nil if b.zero? # Avoid division by zero.

      ((a.to_f / b) * 100).round(1)
    end

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        voting: participations_voting,
        commenting_idea: participations_commenting_idea
      }
    end

    def participations_voting
      @phase.baskets
        .submitted
        .includes(:user, :baskets_ideas, :ideas)
        .map do |basket|
          basket_ideas = basket.baskets_ideas
          total_votes = basket_ideas.to_a.sum(&:votes)
          votes_per_idea = if @phase.voting_method == 'budgeting'
            basket_ideas.to_h { |bi| [bi.idea_id, 1] }
          else
            basket_ideas.to_h { |bi| [bi.idea_id, bi.votes] }
          end

          {
            item_id: basket.id,
            action: 'voting',
            acted_at: basket.submitted_at,
            classname: 'Basket',
            participant_id: participant_id(basket.id, basket.user_id),
            custom_field_values: basket&.user&.custom_field_values || {},
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
          online_picks_7_day_percent_change: online_picks_7_day_percent_change(participations),
          offline_picks: @phase.manual_votes_count,
          voters: participations[:voting].pluck(:participant_id).uniq.count,
          voters_7_day_percent_change: common_7_day_changes[:voters_7_day_percent_change],
          comments_posted: participations[:commenting_idea].count,
          comments_posted_7_day_percent_change: common_7_day_changes[:comments_posted_7_day_percent_change]
        }
      else
        {
          voting_method: @phase.voting_method,
          associated_ideas: associated_published_ideas_count,
          online_votes: participations[:voting].sum { |p| p[:total_votes] },
          online_votes_7_day_percent_change: online_votes_7_day_percent_change(participations),
          offline_votes: @phase.manual_votes_count,
          voters: participations[:voting].pluck(:participant_id).uniq.count,
          voters_7_day_percent_change: common_7_day_changes[:voters_7_day_percent_change],
          comments_posted: participations[:commenting_idea].count,
          comments_posted_7_day_percent_change: common_7_day_changes[:comments_posted_7_day_percent_change]
        }
      end
    end

    def common_7_day_changes(participations)
      result = {
        voters_7_day_percent_change: nil,
        comments_posted_7_day_percent_change: nil
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

      result[:voters_7_day_percent_change] = percentage_change(voters_previous_7_days, voters_last_7_days)
      result[:comments_posted_7_day_percent_change] = percentage_change(comments_previous_7_days, comments_last_7_days)

      result
    end

    def online_picks_7_day_percent_change(participations)
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

    def online_votes_7_day_percent_change(participations)
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
