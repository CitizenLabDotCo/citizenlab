# frozen_string_literal: true

# rubocop:disable Naming/VariableName
require 'query'

class ReportBuilder::QueryRepository
  GRAPH_RESOLVED_NAMES_METHODS = {
    'GenderWidget' => :users_by_gender
  }.freeze

  def data_by_graph(graph_resolved_name, props)
    method = GRAPH_RESOLVED_NAMES_METHODS[graph_resolved_name]
    return unless method

    send(method, **props)
  end

  protected

  def users_by_gender(startAt: nil, endAt: nil, projectId: nil, **_other_props)
    query(
      fact: 'participation',
      groups: 'dimension_user_custom_field_values.value',
      filters: {
        'dimension_user.role': ['citizen', 'admin', nil],
        'dimension_user_custom_field_values.key': 'gender',
        # TODO: try to move `compact.presence` to Analytics::Query
        **{
          'dimension_date_created.date' =>
            { from: startAt, to: endAt }.compact.presence
        }.compact,
        # TODO: use dimension_project_id
        **{ 'dimension_projects.id': projectId }.compact
      },
      aggregations: {
        'dimension_user_custom_field_values.dimension_user_id': 'count' # we count participants, not participations
      }
    )
  end

  def users_by_birthyear; end

  private

  def query(json_query)
    query = Analytics::Query.new(json_query.with_indifferent_access)
    # TODO: it's weird to validate and do not check the result. Fix this.
    query.validate
    query.run
    query.results
  end
end
# rubocop:enable Naming/VariableName
