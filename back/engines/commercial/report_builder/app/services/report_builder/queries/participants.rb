module ReportBuilder
  class Queries::Participants < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: 'month',
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      participations_in_period = participations(
        start_date, end_date, project_id: project_id
      )

      # Time series
      participants_timeseries = participations_in_period
        .select("
          count(distinct participant_id) as participants,
          date_trunc('#{resolution}', dimension_date_created_id) as date_group
        ")
        .group('date_group')
        .order('date_group')
        .map do |row|
          {
            participants: row.participants,
            date_group: row.date_group.to_date
          }
        end

      participants_whole_period = participations_in_period
        .count('distinct participant_id')

      response = {
        participants_timeseries: participants_timeseries,
        participants_whole_period: participants_whole_period,
        participation_rate_whole_period: participation_rate(
          participants_whole_period,
          start_date,
          end_date,
          project_id: project_id
        )
      }

      if compare_start_at && compare_end_at
        participants_compared_period = participations(
          compare_start_at, compare_end_at, project_id: project_id
        )
          .count('distinct participant_id')

        response[:participants_compared_period] = participants_compared_period
        response[:participation_rate_compared_period] = participation_rate(
          participants_compared_period,
          compare_start_at,
          compare_end_at,
          project_id: project_id
        )
      end

      response
    end

    def participations(start_date, end_date, project_id: nil)
      participations = Analytics::FactParticipation
        .where(dimension_date_created_id: start_date..end_date)

      if project_id.present?
        participations = participations
          .where(dimension_project_id: project_id)
      end

      participations
    end

    def participation_rate(participants, start_date, end_date, project_id: nil)
      sessions = ImpactTracking::Session

      if project_id.present?
        sessions_with_project = ImpactTracking::Pageview.where(project_id: project_id).select(:session_id)
        sessions = sessions.where(id: sessions_with_project)
      end

      visitors = sessions
        .where(created_at: start_date..end_date)
        .distinct
        .pluck(:monthly_user_hash)
        .count

      visitors.zero? ? 0 : (participants / visitors.to_f)
    end
  end
end
