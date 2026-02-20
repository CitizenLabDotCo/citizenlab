module Insights
  class NativeSurveyPhaseInsightsService < BasePhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      { submitting_idea: participations_submitting_idea }
    end

    def phase_ideas
      @phase_ideas ||= @phase.ideas.transitive(false).includes(:author)
    end

    def participations_submitting_idea
      phase_ideas.published.map do |idea|
        {
          item_id: idea.id,
          action: 'submitting_idea',
          acted_at: idea.submitted_at,
          classname: 'Idea',
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: parse_user_custom_field_values(idea, idea&.author)
        }
      end
    end

    def phase_participation_method_metrics(participations)
      posted_ideas_count = phase_ideas.count
      total_submitted_surveys = participations[:submitting_idea].count
      completion_rate_as_percent = posted_ideas_count > 0 ? (total_submitted_surveys.to_f / posted_ideas_count * 100).round(1) : 'submitted_count_compared_with_zero_ideas'
      rolling_7_day_changes = rolling_7_day_changes(participations)

      {
        surveys_submitted: total_submitted_surveys,
        surveys_submitted_7_day_percent_change: rolling_7_day_changes[:surveys_submitted_7_day_percent_change],
        completion_rate_as_percent: completion_rate_as_percent,
        completion_rate_7_day_percent_change: rolling_7_day_changes[:completion_rate_7_day_percent_change]
      }
    end

    def rolling_7_day_changes(participations)
      result = {
        surveys_submitted_7_day_percent_change: nil,
        completion_rate_7_day_percent_change: nil
      }

      return result unless phase_has_run_more_than_14_days?

      ideas_last_7_days_count = phase_ideas.where(created_at: 7.days.ago..).count
      ideas_previous_7_days_count = phase_ideas.where(created_at: 14.days.ago...7.days.ago).count

      submitted_last_7_days_count = participations[:submitting_idea].count { |p| p[:acted_at] >= 7.days.ago }
      submitted_previous_7_days_count = participations[:submitting_idea].count do |p|
        p[:acted_at] < 7.days.ago && p[:acted_at] >= 14.days.ago
      end

      completion_rate_7_day_percent_change = if ideas_last_7_days_count > 0 && ideas_previous_7_days_count > 0
        completion_rate_last_7_days = submitted_last_7_days_count.to_f / ideas_last_7_days_count
        completion_rate_previous_7_days = submitted_previous_7_days_count.to_f / ideas_previous_7_days_count
        percentage_change(completion_rate_previous_7_days, completion_rate_last_7_days)
      else
        'no_new_survey_responses_in_one_or_both_periods'
      end

      result[:surveys_submitted_7_day_percent_change] = percentage_change(submitted_previous_7_days_count, submitted_last_7_days_count)
      result[:completion_rate_7_day_percent_change] = completion_rate_7_day_percent_change

      result
    end
  end
end
