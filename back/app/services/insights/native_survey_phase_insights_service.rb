module Insights
  class NativeSurveyPhaseInsightsService < BasePhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      { posting_idea: participations_posting_idea }
    end

    def participations_posting_idea
      end_time = @phase.end_at ? @phase.end_at.end_of_day : Time.current.end_of_day
      ideas = @phase.ideas
        .transitive(false)
        .where(<<~SQL.squish, @phase.start_at.beginning_of_day, end_time)
          ideas.created_at >= ? AND ideas.created_at <= ?
        SQL

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.created_at,
          classname: 'Idea',
          survey_submitted_at: idea&.submitted_at,
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: idea&.custom_field_values || {}
        }
      end
    end

    def phase_participation_method_metrics(participations)
      posted_ideas_count = participations[:posting_idea].count
      submitted_survey_participations = participations[:posting_idea].select { |p| p[:survey_submitted_at].present? }
      total_submitted_surveys = submitted_survey_participations.count
      completion_rate = completion_rate(posted_ideas_count, total_submitted_surveys)
      rolling_7_day_changes = rolling_7_day_changes(participations)

      {
        surveys_submitted: total_submitted_surveys,
        surveys_submitted_7_day_change: rolling_7_day_changes[:surveys_submitted_7_day_change],
        completion_rate: completion_rate,
        completion_rate_7_day_change: rolling_7_day_changes[:completion_rate_7_day_change]
      }
    end

    def completion_rate(all, submitted)
      return 0 if all == 0

      (submitted.to_f / all).round(3)
    end

    def rolling_7_day_changes(participations)
      result = {
        surveys_submitted_7_day_change: nil,
        completion_rate_7_day_change: nil
      }

      return result unless phase_has_run_more_than_14_days?

      ideas_last_7_days_count = participations[:posting_idea].count { |p| p[:acted_at] >= 7.days.ago }
      ideas_previous_7_days_count = participations[:posting_idea].count do |p|
        p[:acted_at] < 7.days.ago && p[:acted_at] >= 14.days.ago
      end

      submitted_survey_participations = participations[:posting_idea].select { |p| p[:survey_submitted_at].present? }

      submitted_last_7_days_count = submitted_survey_participations.count { |p| p[:survey_submitted_at] >= 7.days.ago }
      submitted_previous_7_days_count = submitted_survey_participations.count do |p|
        p[:survey_submitted_at] < 7.days.ago && p[:survey_submitted_at] >= 14.days.ago
      end

      completion_rate_last_7_days = completion_rate(ideas_last_7_days_count, submitted_last_7_days_count)
      completion_rate_previous_7_days = completion_rate(ideas_previous_7_days_count, submitted_previous_7_days_count)

      result[:surveys_submitted_7_day_change] = percentage_change(submitted_previous_7_days_count, submitted_last_7_days_count)
      result[:completion_rate_7_day_change] = percentage_change(completion_rate_previous_7_days, completion_rate_last_7_days)

      result
    end
  end
end
