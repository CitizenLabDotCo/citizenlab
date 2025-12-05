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
      ideas_counts = phase_ideas_counts(participations[:posting_idea] || [])
      submitted_survey_participations = participations[:posting_idea]&.select { |p| p[:survey_submitted_at].present? } || []
      total_submitted_surveys = submitted_survey_participations.count
      submitted_surveys_last_7_days = submitted_survey_participations.count { |p| p[:survey_submitted_at] >= 7.days.ago }

      completion_rate = ideas_counts[:total] > 0 ? (total_submitted_surveys.to_f / ideas_counts[:total]).round(3) : 0

      {
        submitted_surveys: total_submitted_surveys,
        submitted_surveys_last_7_days: submitted_surveys_last_7_days,
        completion_rate: completion_rate
      }
    end
  end
end
