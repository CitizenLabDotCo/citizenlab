# frozen_string_literal: true

class McpServer::Tools::ListCauses < McpServer::BaseTool
  def name = 'list_volunteering_causes'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists volunteering causes for a phase, in display order'

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the volunteering phase' },
        **PAGINATION_SCHEMA
      },
      required: %w[phase_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase

      scope = phase.causes.order(:ordering)

      paginated_response(
        'causes',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::Cause,
        params: { current_user: current_user }
      )
    end
  end
end
