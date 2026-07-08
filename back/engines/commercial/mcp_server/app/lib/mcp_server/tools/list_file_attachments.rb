# frozen_string_literal: true

class McpServer::Tools::ListFileAttachments < McpServer::BaseTool
  CONTAINERS = {
    'project' => Project,
    'phase' => Phase,
    'event' => Event
  }.freeze
  private_constant :CONTAINERS

  def name = 'list_file_attachments'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Lists the files attached to a resource, ordered by position. Each file is
      shown as an attachment on the resource's page and can be downloaded from
      there.
    DESC
  end

  def input_schema
    {
      properties: {
        resource_type: { type: 'string', enum: CONTAINERS.keys },
        resource_id: { type: 'string' },
        **PAGINATION_SCHEMA
      },
      required: %w[resource_type resource_id],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      container = CONTAINERS.fetch(params[:resource_type]).find(params[:resource_id])
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
      error("#{params[:resource_type]} not found: #{params[:resource_id]}")
    end
  end
end
