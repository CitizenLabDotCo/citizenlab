module ReportBuilder
  class Queries::Visitors < ReportBuilder::Queries::Base
    def run_query(
      start_at, 
      end_at,
      resolution: 'month',
      project_id: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      sessions = ImpactTracking::Session.where(created_at: start_at..end_at)

      time_series = sessions
        .select(
          "count(*) as visits, count(distinct(monthly_user_hash)) as visitors, date_trunc('#{resolution}', created_at) as date_group"
        )
        .group("date_group")
        .order("date_group")
        .map do |row|
          {
            visits: row.visits,
            visitors: row.visitors,
            date_group: row.date_group.to_date
          }
        end

      # Total number of visits and visitors
      visits_total = sessions.count
      visitors_total = sessions.distinct.pluck(:monthly_user_hash).count

      ### Avg seconds on page, and avg pages visited per session
      pageviews = ImpactTracking::Pageview.where(session_id: sessions.select(:id))

      # Avg seconds on page
      seconds_on_page_subqery = pageviews
        .select(
          <<-SQL.squish
            extract(epoch from
              (lead(created_at,1) over (partition by session_id order by created_at)) - created_at
            ) as seconds_on_page
          SQL
        )
        .to_sql

      seconds_on_page_query = ActiveRecord::Base.connection.execute(
        <<-SQL.squish
          select
            count(subquery.seconds_on_page) as count,
            sum(subquery.seconds_on_page) as sum
          from (#{seconds_on_page_subqery}) as subquery
          where subquery.seconds_on_page is not null
        SQL
      )

      aggregations = seconds_on_page_query.to_a[0]
      avg_seconds_on_page = aggregations["sum"] / aggregations["count"]

      # Avg pages visited per sessions
      avg_pages_visited = pageviews.count / visits_total

      # If compare_start_at and compare_end_at are present:
      if compare_start_at.present? && compare_end_at.present?
        # TODO
      end

      {
        time_series: time_series,
        visits_total: visits_total,
        visitors_total: visitors_total,
        avg_seconds_on_page: avg_seconds_on_page,
        avg_pages_visited: avg_pages_visited
      }
    end
  end
end
