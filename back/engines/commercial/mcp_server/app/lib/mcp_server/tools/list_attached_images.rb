# frozen_string_literal: true

class McpServer::Tools::ListAttachedImages < McpServer::BaseTool
  CONTAINERS = {
    'Project' => { class: Project, association: :project_images },
    'Event' => { class: Event, association: :event_images }
  }.freeze
  private_constant :CONTAINERS

  def name = 'list_attached_images'
  def description = 'Lists the images attached to a container.'

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
      config = CONTAINERS.fetch(params[:container_type])
      container = config[:class].find(params[:container_id])

      scope = container
        .public_send(config[:association])
        .order(:ordering)

      paginated_response(
        'images',
        scope,
        serializer: McpServer::Serializers::Image,
        **params.slice(:page, :per_page)
      )
    rescue ActiveRecord::RecordNotFound
      error("#{params[:container_type]} not found: #{params[:container_id]}")
    end
  end
end
