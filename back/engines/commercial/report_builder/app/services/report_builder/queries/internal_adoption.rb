module ReportBuilder
  class Queries::InternalAdoption < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      resolution: 'month',
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      response = get_period_data(start_date, end_date, resolution)

      # Add comparison period data if requested
      if compare_start_at && compare_end_at
        compare_start_date, compare_end_date = TimeBoundariesParser.new(compare_start_at, compare_end_at).parse
        compare_data = get_period_counts(compare_start_date, compare_end_date)

        response[:active_admins_compared] = compare_data[:admins]
        response[:active_moderators_compared] = compare_data[:moderators]
        response[:total_registered_compared] = compare_data[:total_registered_count]
      end

      response
    end

    private

    def get_period_data(start_date, end_date, resolution)
      # Get total registered admins and moderators as of the end date
      total_registered_count = get_total_registered_count(end_date)

      # Single query with GROUPING SETS to get both timeseries and overall counts
      results = ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .select(
          "date_trunc('#{resolution}', created_at) as date_group,
           COUNT(DISTINCT CASE WHEN highest_role = 'admin' THEN user_id END) as admin_count,
           COUNT(DISTINCT CASE WHEN highest_role = 'project_moderator' THEN user_id END) as moderator_count,
           COUNT(DISTINCT CASE WHEN highest_role IN ('admin', 'project_moderator') THEN user_id END) as total_count"
        )
        .group("GROUPING SETS ((date_trunc('#{resolution}', created_at)), ())")
        .order('date_group NULLS LAST')

      # Build timeseries arrays and capture overall counts
      admins_timeseries = []
      moderators_timeseries = []
      total_timeseries = []
      overall_admin_count = 0
      overall_moderator_count = 0

      results.each do |row|
        if row.date_group.nil?
          # This is the overall totals row (from the empty grouping set)
          overall_admin_count = row.admin_count
          overall_moderator_count = row.moderator_count
        else
          # This is a timeseries data point
          date_group = row.date_group.to_date
          admins_timeseries << { count: row.admin_count, date_group: date_group }
          moderators_timeseries << { count: row.moderator_count, date_group: date_group }
          total_timeseries << { count: row.total_count, date_group: date_group }
        end
      end

      {
        active_admins_count: overall_admin_count,
        active_moderators_count: overall_moderator_count,
        total_registered_count: total_registered_count,
        active_admins_timeseries: admins_timeseries,
        active_moderators_timeseries: moderators_timeseries,
        total_active_timeseries: total_timeseries
      }
    end

    def get_period_counts(start_date, end_date)
      total_registered_count = get_total_registered_count(end_date)

      counts = ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .select(
          "COUNT(DISTINCT CASE WHEN highest_role = 'admin' THEN user_id END) as admin_count,
           COUNT(DISTINCT CASE WHEN highest_role = 'project_moderator' THEN user_id END) as moderator_count"
        )
        .take

      {
        admins: counts.admin_count,
        moderators: counts.moderator_count,
        total_registered_count: total_registered_count
      }
    end

    def get_total_registered_count(end_date)
      User.admin_or_moderator.not_super_admins
        .where(created_at: ..end_date)
        .count
    end
  end
end
