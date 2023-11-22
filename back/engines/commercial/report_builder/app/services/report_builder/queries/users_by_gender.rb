# rubocop:disable Naming/VariableName
module ReportBuilder
  class Queries::UsersByGender < Queries::Base
    def query(startAt: nil, endAt: nil, projectId: nil, **_other_props)
      {
        fact: 'participation',
        groups: 'dimension_user_custom_field_values.value',
        filters: {
          'dimension_user.role': ['citizen', 'admin', nil],
          'dimension_user_custom_field_values.key': 'gender',
          **date_filter('dimension_date_created', startAt, endAt),
          **project_filter('dimension_project_id', projectId)
        },
        aggregations: {
          'dimension_user_custom_field_values.dimension_user_id': 'count'
        }
      }
    end
  end
end
# rubocop:enable Naming/VariableName
