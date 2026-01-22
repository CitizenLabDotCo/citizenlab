module Insights
  class NativeSurveyPhaseInsightsService < BasePhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      { submitting_idea: participations_submitting_idea }
    end

    def phase_ideas
      @phase_ideas ||= @phase.ideas.transitive(false)
    end

    def participations_submitting_idea
      phase_ideas.published.map do |idea|
        {
          item_id: idea.id,
          action: 'submitting_idea',
          acted_at: idea.created_at,
          classname: 'Idea',
          survey_submitted_at: idea&.submitted_at,
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: idea&.custom_field_values || {}
        }
      end
    end

    def phase_participation_method_metrics(participations)
      posted_ideas_count = phase_ideas.count
      total_submitted_surveys = participations[:submitting_idea].count
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

      ideas_last_7_days_count = phase_ideas.where(created_at: 7.days.ago..).count
      ideas_previous_7_days_count = phase_ideas.where(created_at: 14.days.ago...7.days.ago).count

      submitted_last_7_days_count = participations[:submitting_idea].count { |p| p[:survey_submitted_at] >= 7.days.ago }
      submitted_previous_7_days_count = participations[:submitting_idea].count do |p|
        p[:survey_submitted_at] < 7.days.ago && p[:survey_submitted_at] >= 14.days.ago
      end

      completion_rate_last_7_days = completion_rate(ideas_last_7_days_count, submitted_last_7_days_count)
      completion_rate_previous_7_days = completion_rate(ideas_previous_7_days_count, submitted_previous_7_days_count)

      # puts "Last 7 days - Ideas: #{ideas_last_7_days_count}, Submitted: #{submitted_last_7_days_count}, Completion Rate: #{completion_rate_last_7_days}"
      # puts "Previous 7 days - Ideas: #{ideas_previous_7_days_count}, Submitted: #{submitted_previous_7_days_count}, Completion Rate: #{completion_rate_previous_7_days}"

      result[:surveys_submitted_7_day_change] = percentage_change(submitted_previous_7_days_count, submitted_last_7_days_count)
      result[:completion_rate_7_day_change] = percentage_change(completion_rate_previous_7_days, completion_rate_last_7_days)

      result
    end
  end
end
