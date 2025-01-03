module ReportBuilder
  class Queries::Analytics::Participation < Queries::Analytics::Base
    protected

    def query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      # First, the time series
      inputs_time_series = {
        fact: 'post',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': %w[idea],
          publication_status: 'published'
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      comments_time_series = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'comment',
          'dimension_type.parent': %w[idea]
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      baskets_time_series = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'basket'
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      queries = [
        inputs_time_series,
        comments_time_series,
        baskets_time_series
      ]

      # We will derive the totals of the whole period in the FE, based on the time series

      # Second, if necessary, the comparisons
      if compare_start_at.present? && compare_end_at.present?
        inputs_compared_period = {
          fact: 'post',
          filters: {
            **date_filter('dimension_date_created', compare_start_at, compare_end_at),
            **project_filter('dimension_project_id', project_id),
            'dimension_type.name': 'idea',
            publication_status: 'published'
          },
          aggregations: {
            all: 'count'
          }
        }

        comments_compared_period = {
          fact: 'participation',
          filters: {
            **date_filter('dimension_date_created', compare_start_at, compare_end_at),
            **project_filter('dimension_project_id', project_id),
            'dimension_type.name': 'comment',
            'dimension_type.parent': %w[idea]
          },
          aggregations: {
            all: 'count'
          }
        }

        baskets_compared_period = {
          fact: 'participation',
          filters: {
            **date_filter('dimension_date_created', start_at, end_at),
            **project_filter('dimension_project_id', project_id),
            'dimension_type.name': 'basket'
          },
          aggregations: {
            all: 'count'
          }
        }

        queries << inputs_compared_period
        queries << comments_compared_period
        queries << baskets_compared_period
      end

      queries
    end
  end
end
