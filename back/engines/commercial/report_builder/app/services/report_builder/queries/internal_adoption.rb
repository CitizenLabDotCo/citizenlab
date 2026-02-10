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
      active_counts = get_active_counts(compare_start_date, compare_end_date)
      registered_counts = get_registered_counts(compare_end_date)

      response.merge(
        admin_counts_compared: {
          registered: registered_counts[:admins],
          active: active_counts[:admins_count]
        },
        moderator_counts_compared: {
          registered: registered_counts[:moderators],
          active: active_counts[:moderators_count]
        }
      )
    end

    def get_period_data(start_date, end_date, resolution)
      active_counts = get_active_counts(start_date, end_date)
      registered_counts = get_registered_counts(end_date)
      timeseries = query_timeseries(start_date, end_date, resolution)

      {
        admin_counts: {
          registered: registered_counts[:admins],
          active: active_counts[:admins_count]
        },
        moderator_counts: {
          registered: registered_counts[:moderators],
          active: active_counts[:moderators_count]
        },
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

    def get_active_counts(start_date, end_date)
      counts = ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .select(
          role_count_sql(ADMIN_ROLES, 'admins_count'),
          role_count_sql(MODERATOR_ROLES, 'moderators_count')
        )
        .take

      {
        admins_count: counts.admins_count,
        moderators_count: counts.moderators_count
      }
    end

    def get_registered_counts(end_date)
      base_scope = User.not_super_admins.where(created_at: ..end_date)
      admins = base_scope.admin.count
      moderators = base_scope.admin_or_moderator.count - admins

      { admins: admins, moderators: moderators }
    end

    def role_count_sql(roles, alias_name)
      quoted = roles.map { |r| "'#{r}'" }.join(', ')
      "COUNT(DISTINCT CASE WHEN highest_role IN (#{quoted}) THEN user_id END) as #{alias_name}"
    end
  end
end
