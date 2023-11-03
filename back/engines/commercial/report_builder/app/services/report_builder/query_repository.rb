# frozen_string_literal: true

class ReportBuilder::QueryRepository
  MAPPING = {
    'GenderWidget' => :users_by_gender,
  }

  def users_by_gender
    query(fact: 'participation',
      groups: 'dimension_date_created.month',
      filters: {
        'dimension_user.role': ['citizen', 'admin', nil],
        'dimension_user_custom_field_values.key': 'gender',
        'dimension_user_custom_field_values.value': 'female'
      },
      aggregations: {
        'dimension_user_custom_field_values.dimension_user_id': 'count', # we count participants, not participations
        'dimension_date_created.date': 'first'
      })
  end

  def users_by_birthyear; end

  private

  def query(json_query)
    query = Analytics::Query.new(json_query)
    query.run
    query.results
  end
end
