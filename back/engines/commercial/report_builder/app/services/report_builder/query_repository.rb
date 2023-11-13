# frozen_string_literal: true

require 'query'

class ReportBuilder::QueryRepository
  GRAPH_RESOLVED_NAMES_METHODS = {
    'GenderWidget' => :users_by_gender
  }

  def data_by_graph(graph_resolved_name, props)
    method = GRAPH_RESOLVED_NAMES_METHODS[graph_resolved_name]
    return unless method

    send(method, props)
  end

  protected

  def users_by_gender(_props = nil)
    query(
      fact: 'participation',
      groups: 'dimension_date_created.month',
      filters: {
        'dimension_user.role': ['citizen', 'admin', nil]
      },
      aggregations: {
        'dimension_user_custom_field_values.dimension_user_id': 'count', # we count participants, not participations
        'dimension_date_created.date': 'first'
      }
    )
  end

  def users_by_birthyear; end

  private

  def query(json_query)
    query = Analytics::Query.new(json_query.with_indifferent_access)
    query.validate
    query.run
    query.results
  end
end
