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
      submitted_survey_participations = participations[:posting_idea]&.select { |p| p[:survey_submitted_at].present? } || []
      total_submitted_surveys = submitted_survey_participations.count
      completion_rate = completion_rate(posted_ideas_count, total_submitted_surveys)

      if phase_has_run_more_than_14_days?
        ideas_last_7_days_count = participations[:posting_idea].select { |p| p[:acted_at] >= 7.days.ago }.count
        ideas_last_14_to_8_days_count = participations[:posting_idea].select do |p|
          p[:acted_at] < 7.days.ago && p[:acted_at] >= 14.days.ago
        end.count

        submitted_last_7_days_count = submitted_survey_participations.select { |p| p[:survey_submitted_at] >= 7.days.ago }.count
        submitted_last_14_to_8_days_count = submitted_survey_participations.select do |p|
          p[:survey_submitted_at] < 7.days.ago && p[:survey_submitted_at] >= 14.days.ago
        end.count

        completion_rate_last_7_days = completion_rate(ideas_last_7_days_count, submitted_last_7_days_count)
        completion_rate_last_14_to_8_days = completion_rate(ideas_last_14_to_8_days_count, submitted_last_14_to_8_days_count)

        {
          submitted_surveys: total_submitted_surveys,
          submitted_surveys_rolling_7_day_change: percentage_change(submitted_last_14_to_8_days_count, submitted_last_7_days_count),
          completion_rate: completion_rate,
          completion_rate_rolling_7_day_change: percentage_change(completion_rate_last_14_to_8_days, completion_rate_last_7_days)
        }
      else
        {
          submitted_surveys: total_submitted_surveys,
          submitted_surveys_rolling_7_day_change: nil,
          completion_rate: completion_rate,
          completion_rate_rolling_7_day_change: nil
        }
      end
    end

    def completion_rate(all, submitted)
      return 0 if all == 0

      (submitted.to_f / all).round(3)
    end

    def submitted_surveys_rolling_7_day_change(participations)
      return nil unless phase_has_run_more_than_14_days?
      return 0.0 if participations.empty?

      participations_last_7_days_count = participations.select { |p| p[:survey_submitted_at] >= 7.days.ago }
      participations_last_14_to_8_days_count = participations.select do |p|
        p[:survey_submitted_at] < 7.days.ago && p[:survey_submitted_at] >= 14.days.ago
      end

      puts "participations_last_7_days_count: #{participations_last_7_days_count.count}, participations_last_14_to_8_days_count: #{participations_last_14_to_8_days_count.count}"

      percentage_change(
        participations_last_14_to_8_days_count.count,
        participations_last_7_days_count.count
      )
    end
  end
end
