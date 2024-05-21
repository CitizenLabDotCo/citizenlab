module ReportBuilder
  class Queries::Analytics::CommentsByTime < Queries::Analytics::Base
    protected

    def query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: nil,
      compare_start_at: nil,
      compare_end_at: nil
    )
      # First, the time series
      inputs_time_series = {
        fact: 'post',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'idea',
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
          'dimension_type.parent': %w[idea initiative]
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      # Second, add totals
      inputs_total = {
        fact: 'post',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'idea',
          publication_status: 'published'
        },
        aggregations: {
          all: 'count'
        }
      }

      comments_total = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'comment',
          'dimension_type.parent': %w[idea initiative]
        },
        aggregations: {
          all: 'count'
        }
      }

      queries = [
        inputs_time_series,
        comments_time_series,
        inputs_total,
        comments_total
      ]

      if compare_start_at.present? && compare_end_at.present?
        # TODO
      end

      queries
    end
  end
end
