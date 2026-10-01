module ReportBuilder
  class Queries::Participants < ReportBuilder::Queries::Base
    # Calculates participant timeseries, counts and participation rates over specified time periods
    # @param start_at [String, Date] Beginning of analysis period (YYYY-MM-DD)
    # @param end_at [String, Date] End of analysis period (YYYY-MM-DD)
    # @param project_id [String] Optional project ID to filter participants
    # @param exclude_admins_and_moderators [Boolean] Leave out admins and moderators from participant counts
    # @param resolution [String] Time grouping ('day', 'week', or 'month')
    # @return [Hash] Participant timeseries, counts and participation rates
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: 'month',
      exclude_admins_and_moderators: false,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_at, end_at = TimeBoundaries.parse(start_at, end_at)

      participations_in_period = participations(
        start_at,
        end_at,
        project_id: project_id,
        exclude_admins_and_moderators: exclude_admins_and_moderators
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
        participation_rate_whole_period: participation_rate_as_percent(
          participants_whole_period,
          start_at,
          end_at,
          project_id: project_id,
          exclude_admins_and_moderators: exclude_admins_and_moderators
        )
      }

      if compare_start_at && compare_end_at
        compare_start_at, compare_end_at = TimeBoundaries.parse(compare_start_at, compare_end_at)
        participants_compared_period = participations(
          compare_start_at,
          compare_end_at,
          project_id: project_id,
          exclude_admins_and_moderators: exclude_admins_and_moderators
        )
          .count('distinct participant_id')

        response[:participants_compared_period] = participants_compared_period
        response[:participation_rate_compared_period] = participation_rate_as_percent(
          participants_compared_period,
          compare_start_at,
          compare_end_at,
          project_id: project_id,
          exclude_admins_and_moderators: exclude_admins_and_moderators
        )
      end

      response
    end

    def participations(
      start_at,
      end_at,
      project_id: nil,
      exclude_admins_and_moderators: false
    )
      participations = Analytics::FactParticipation
        .where(dimension_date_created_id: start_at...end_at)

      if project_id.present?
        participations = participations
          .where(dimension_project_id: project_id)
      end

      exclude_admins_and_moderators_from_participations(participations, exclude_admins_and_moderators)
    end

    def participation_rate_as_percent(participants, start_at, end_at, project_id: nil, exclude_admins_and_moderators: false)
      visits_service = Insights::VisitsService.new(project_id, start_at:, end_at:, exclude_admins_and_moderators:)
      visitors = visits_service.total_visits[:visitors]
      visitors.zero? ? 0 : (participants / visitors.to_f)
    end
  end
end
