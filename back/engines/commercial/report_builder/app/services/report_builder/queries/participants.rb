module ReportBuilder
  class Queries::Participants < ReportBuilder::Queries::Base
    # Calculates participant timeseries, counts and participation rates over specified time periods
    # @param start_at [String, Date] Beginning of analysis period (YYYY-MM-DD)
    # @param end_at [String, Date] End of analysis period (YYYY-MM-DD)
    # @param project_id [String] Optional project ID to filter participants
    # @param exclude_roles [<String>] Flag to exclude certain roles from participant counts ('exclude_admins_and_moderators')
    # @param resolution [String] Time grouping ('day', 'week', or 'month')
    # @return [Hash] Participant timeseries, counts and participation rates
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      phase_id: nil,
      resolution: 'month',
      exclude_roles: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      phase_stats_on = true
      return phase_response(phase_id, resolution) if phase_id.present? && phase_stats_on

      participations_in_period = participations(
        start_date,
        end_date,
        project_id: project_id,
        exclude_roles: exclude_roles
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
          project_id: project_id,
          exclude_roles: exclude_roles
        )
      }

      if compare_start_at && compare_end_at
        participants_compared_period = participations(
          compare_start_at,
          compare_end_at,
          project_id: project_id,
          exclude_roles: exclude_roles
        )
          .count('distinct participant_id')

        response[:participants_compared_period] = participants_compared_period
        response[:participation_rate_compared_period] = participation_rate(
          participants_compared_period,
          compare_start_at,
          compare_end_at,
          project_id: project_id,
          exclude_roles: exclude_roles
        )
      end

      response
    end

    def phase_response(phase_id, resolution)
      phase = Phase.find(phase_id)
      participations_hash = phase.pmethod.phase_insights_class.new(phase).cached_phase_participations
      participations = participations_hash.values.flatten

      # Group participations by resolution and count unique participants
      grouped_participations = participations.group_by { |p| date_truncate(p[:acted_at], resolution) }

      grouped_participants_timeseries = grouped_participations.map do |date_group, participations_in_group|
        {
          participants: participations_in_group.pluck(:participant_id).uniq.count,
          date_group: date_group
        }
      end

      participants_timeseries = grouped_participants_timeseries.sort_by { |row| row[:date_group] }

      participants_whole_period = participations
        .pluck(:participant_id)
        .uniq
        .count

      {
        participants_timeseries: participants_timeseries,
        participants_whole_period: participants_whole_period,
        participation_rate_whole_period: nil # Could calculate if needed
      }
    end

    def participations(
      start_date,
      end_date,
      project_id: nil,
      exclude_roles: nil
    )
      participations = Analytics::FactParticipation
        .where(dimension_date_created_id: start_date..end_date)

      if project_id.present?
        participations = participations
          .where(dimension_project_id: project_id)
      end

      if exclude_roles == 'exclude_admins_and_moderators'
        participations = participations
          .joins('INNER JOIN users ON users.id = analytics_fact_participations.dimension_user_id')

        # Normal users have a 'rules' attribute which is just an empty array.
        participations = participations.where('jsonb_array_length(users.roles) = 0')
      end

      participations
    end

    def participation_rate(
      participants,
      start_date,
      end_date,
      project_id: nil,
      exclude_roles: nil
    )
      query = ImpactTracking::Session
        .where(created_at: start_date..end_date)

      if project_id.present?
        query = query
          .joins('INNER JOIN impact_tracking_pageviews ON impact_tracking_pageviews.session_id = impact_tracking_sessions.id')
          .where(impact_tracking_pageviews: { project_id: project_id })
      end

      if exclude_roles == 'exclude_admins_and_moderators'
        query = query
          .where("highest_role IS NULL OR highest_role = 'user'")
      end

      visitors = query.distinct.count(:monthly_user_hash)

      visitors.zero? ? 0 : (participants / visitors.to_f)
    end

    def date_truncate(datetime, resolution)
      date = datetime.to_date
      case resolution
      when 'day'
        date
      when 'week'
        date.beginning_of_week
      when 'month'
        Date.new(date.year, date.month, 1)
      when 'year'
        Date.new(date.year, 1, 1)
      else
        raise ArgumentError, "Invalid resolution: #{resolution}"
      end
    end
  end
end
