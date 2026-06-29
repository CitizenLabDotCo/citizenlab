# frozen_string_literal: true

class McpServer::Tools::ListFileAttachments < McpServer::BaseTool
  CONTAINERS = {
    'Project' => Project,
    'Phase' => Phase,
    'Event' => Event
  }.freeze
  private_constant :CONTAINERS

  def name = 'list_file_attachments'
  def description = 'Lists the files attached to a container, ordered by position.'

  def input_schema
    {
      properties: {
        container_type: { type: 'string', enum: CONTAINERS.keys },
        container_id: { type: 'string' },
        **PAGINATION_SCHEMA
      },
      required: %w[container_type container_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      container = CONTAINERS.fetch(params[:container_type]).find(params[:container_id])
      scope = Files::FileAttachment
        .where(attachable: container)
        .includes(:file)
        .ordered

      paginated_response(
        'file_attachments',
        scope,
        serializer: McpServer::Serializers::FileAttachment,
        **params.slice(:page, :per_page)
      )
    rescue ActiveRecord::RecordNotFound
      error("#{params[:container_type]} not found: #{params[:container_id]}")
    end
  end
end
