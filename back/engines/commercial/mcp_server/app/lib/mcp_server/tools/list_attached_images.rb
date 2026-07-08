# frozen_string_literal: true

class McpServer::Tools::ListAttachedImages < McpServer::BaseTool
  CONTAINERS = {
    'Project' => { class: Project, association: :project_images },
    'Event' => { class: Event, association: :event_images }
  }.freeze
  private_constant :CONTAINERS

  def name = 'list_attached_images'

  def description
    <<~DESC.squish
      Lists the images attached to a resource. Each image is shown on the
      resource's page.
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
      config = CONTAINERS.fetch(params[:resource_type])
      container = config[:class].find(params[:resource_id])

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
      error("#{params[:resource_type]} not found: #{params[:resource_id]}")
    end
  end
end
