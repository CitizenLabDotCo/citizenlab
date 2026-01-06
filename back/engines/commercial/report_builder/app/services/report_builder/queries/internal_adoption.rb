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

      start_date, end_date = parse_time_boundaries(start_at, end_at)
      response = get_period_data(start_date, end_date, resolution)

      if comparison_requested?(compare_start_at, compare_end_at)
        merge_comparison_data!(response, compare_start_at, compare_end_at)
      end

      response
    end

    private

    def parse_time_boundaries(start_at, end_at)
      TimeBoundariesParser.new(start_at, end_at).parse
    end

    def comparison_requested?(compare_start_at, compare_end_at)
      compare_start_at && compare_end_at
    end

    def merge_comparison_data!(response, compare_start_at, compare_end_at)
      compare_start_date, compare_end_date = parse_time_boundaries(compare_start_at, compare_end_at)
      compare_data = get_period_counts(compare_start_date, compare_end_date)

      response[:active_admins_compared] = compare_data[:admins]
      response[:active_moderators_compared] = compare_data[:moderators]
      response[:total_registered_compared] = compare_data[:total_registered_count]
    end

    def get_period_data(start_date, end_date, resolution)
      results = query_sessions_with_timeseries(start_date, end_date, resolution)
      admins_timeseries, moderators_timeseries, overall_counts = process_timeseries_results(results)

      {
        active_admins_count: overall_counts[:admin_count],
        active_moderators_count: overall_counts[:moderator_count],
        total_registered_count: get_total_registered_count(end_date),
        active_admins_timeseries: admins_timeseries,
        active_moderators_timeseries: moderators_timeseries
      }
    end

    def query_sessions_with_timeseries(start_date, end_date, resolution)
      ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .select(
          "date_trunc('#{resolution}', created_at) as date_group",
          role_count_sql('admin', 'admin_count'),
          role_count_sql('project_moderator', 'moderator_count')
        )
        .group("GROUPING SETS ((date_trunc('#{resolution}', created_at)), ())")
        .order('date_group NULLS LAST')
    end

    def process_timeseries_results(results)
      admins_timeseries = []
      moderators_timeseries = []
      overall_counts = { admin_count: 0, moderator_count: 0 }

      results.each do |row|
        if row.date_group.nil?
          overall_counts[:admin_count] = row.admin_count
          overall_counts[:moderator_count] = row.moderator_count
        else
          date_group = row.date_group.to_date
          admins_timeseries << { count: row.admin_count, date_group: date_group }
          moderators_timeseries << { count: row.moderator_count, date_group: date_group }
        end
      end

      [admins_timeseries, moderators_timeseries, overall_counts]
    end

    def get_period_counts(start_date, end_date)
      counts = ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .select(
          role_count_sql('admin', 'admin_count'),
          role_count_sql('project_moderator', 'moderator_count')
        )
        .take

      {
        admins: counts.admin_count,
        moderators: counts.moderator_count,
        total_registered_count: get_total_registered_count(end_date)
      }
    end

    def role_count_sql(role, alias_name)
      "COUNT(DISTINCT CASE WHEN highest_role = '#{role}' THEN user_id END) as #{alias_name}"
    end

    def get_total_registered_count(end_date)
      User.admin_or_moderator.not_super_admins
        .where(created_at: ..end_date)
        .count
    end
  end
end
