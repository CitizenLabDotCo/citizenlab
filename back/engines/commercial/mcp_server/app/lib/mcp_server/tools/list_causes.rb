# frozen_string_literal: true

class McpServer::Tools::ListCauses < McpServer::BaseTool
  def name = 'list_volunteering_causes'
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
      scope = Volunteering::Cause
        .where(phase_id: params[:phase_id])
        .order(:ordering)

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
