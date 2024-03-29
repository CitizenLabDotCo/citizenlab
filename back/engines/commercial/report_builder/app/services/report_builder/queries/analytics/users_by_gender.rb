module ReportBuilder
  # Not used atm, the same as dimension_user_custom_field_values
  class Queries::Analytics::UsersByGender < Queries::Analytics::Base
    protected

    def query(start_at: nil, end_at: nil, project_id: nil, **_other_props)
      {
        fact: 'participation',
        groups: 'dimension_user_custom_field_values.value',
        filters: {
          'dimension_user_custom_field_values.key': 'gender',
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id)
        },
        aggregations: {
          'dimension_user_custom_field_values.dimension_user_id': 'count'
        }
      }
    end
  end
end
