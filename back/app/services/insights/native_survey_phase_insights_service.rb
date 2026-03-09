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
      survey_7_day_changes = survey_7_day_changes(participations, posted_ideas_count)

      {
        surveys_submitted: total_submitted_surveys,
        surveys_submitted_7_day_percent_change: survey_7_day_changes[:surveys_submitted_7_day_percent_change],
        completion_rate_as_percent: completion_rate_as_percent,
        completion_rate_7_day_percent_change: survey_7_day_changes[:completion_rate_7_day_percent_change]
      }
    end

    def survey_7_day_changes(participations, posted_ideas_count)
      result = {
        surveys_submitted_7_day_percent_change: nil,
        completion_rate_7_day_percent_change: nil
      }

      return result unless phase_has_run_more_than_7_days?

      posted_ideas_count_7_days_ago = phase_ideas.where(created_at: ...7.days.ago).count
      submitted_surveys_count = participations[:submitting_idea].count
      submitted_surveys_count_7_days_ago = participations[:submitting_idea].count { |p| p[:acted_at] < 7.days.ago }

      completion_rate_7_day_percent_change = if posted_ideas_count > 0 && posted_ideas_count_7_days_ago > 0
        completion_rate_now = submitted_surveys_count.to_f / posted_ideas_count
        completion_rate_7_days_ago = submitted_surveys_count_7_days_ago.to_f / posted_ideas_count_7_days_ago

        percentage_change(completion_rate_7_days_ago, completion_rate_now)
      else
        'no_new_survey_responses_in_one_or_both_periods'
      end

      result[:surveys_submitted_7_day_percent_change] = percentage_change(submitted_surveys_count_7_days_ago, submitted_surveys_count)
      result[:completion_rate_7_day_percent_change] = completion_rate_7_day_percent_change

      result
    end
  end
end
