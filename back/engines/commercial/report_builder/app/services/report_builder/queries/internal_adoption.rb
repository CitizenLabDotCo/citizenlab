module ReportBuilder
  class Queries::InternalAdoption < ReportBuilder::Queries::Base
    ADMIN_ROLES = %w[admin].freeze
    MODERATOR_ROLES = %w[project_moderator project_folder_moderator].freeze

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
        response = merge_comparison_data(response, compare_start_at, compare_end_at)
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

    def merge_comparison_data(response, compare_start_at, compare_end_at)
      compare_start_date, compare_end_date = parse_time_boundaries(compare_start_at, compare_end_at)
      compare_data = get_period_counts(compare_start_date, compare_end_date)

      response.merge(
        active_admins_compared: compare_data[:admins_count],
        active_moderators_compared: compare_data[:moderators_count],
        total_admin_pm_compared: compare_data[:total_admin_pm_count]
      )
    end

    def get_period_data(start_date, end_date, resolution)
      counts = get_period_counts(start_date, end_date)
      timeseries = query_timeseries(start_date, end_date, resolution)

      {
        active_admins_count: counts[:admins_count],
        active_moderators_count: counts[:moderators_count],
        total_admin_pm_count: counts[:total_admin_pm_count],
        timeseries: timeseries
      }
    end

    def query_timeseries(start_date, end_date, resolution)
      ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .select(
          "date_trunc('#{resolution}', created_at)::date as date_group",
          role_count_sql(ADMIN_ROLES, 'admins_count'),
          role_count_sql(MODERATOR_ROLES, 'moderators_count')
        )
        .group("date_trunc('#{resolution}', created_at)")
        .order('date_group')
        .map do |row|
          {
            date_group: row.date_group,
            active_admins: row.admins_count,
            active_moderators: row.moderators_count
          }
        end
    end

    def get_period_counts(start_date, end_date)
      counts = ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .select(
          role_count_sql(ADMIN_ROLES, 'admins_count'),
          role_count_sql(MODERATOR_ROLES, 'moderators_count')
        )
        .take

      {
        admins_count: counts.admins_count,
        moderators_count: counts.moderators_count,
        total_admin_pm_count: get_total_admin_pm_count(end_date)
      }
    end

    def role_count_sql(roles, alias_name)
      quoted = roles.map { |r| "'#{r}'" }.join(', ')
      "COUNT(DISTINCT CASE WHEN highest_role IN (#{quoted}) THEN user_id END) as #{alias_name}"
    end

    def get_total_admin_pm_count(end_date)
      User.admin_or_moderator.not_super_admins
        .where(created_at: ..end_date)
        .count
    end
  end
end
