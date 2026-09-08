# frozen_string_literal: true

class McpServer::Tools::ListInputs < McpServer::BaseTool
  def name = 'list_inputs'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Lists the published inputs (ideas, proposals or native survey responses) of a phase,
      newest first, in a lean row shape. Search by title or body. Read a single input's
      full content (body, form answers) with get_resource type 'input'.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the phase to list the inputs of.' },
        search: { type: 'string', description: 'Search by title or body' },
        **PAGINATION_SCHEMA
      },
      required: %w[phase_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase

      scope = phase.ideas.published.order(created_at: :desc)
      scope = scope.search_by_all(params[:search]) if params[:search].present?

      paginated_response(
        'inputs',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::InputSummary
      )
    end
  end
end
