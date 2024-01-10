module ReportBuilder
  class Queries::Analytics::TrafficSources < Queries::Analytics::Base
    protected

    def query(start_at: nil, end_at: nil, project_id: nil, resolution: nil, **_other_props)
      {
        fact: 'visit',
        filters: {
          'dimension_user.role': ['citizen', nil],
          **project_filter('dimension_projects.id', project_id),
          **date_filter(
            'dimension_date_first_action',
            start_at,
            end_at
          )
        },
        groups: 'dimension_referrer_type.id',
        aggregations: {
          all: 'count',
          'dimension_referrer_type.name': 'first'
        }
      }
    end
  end
end
