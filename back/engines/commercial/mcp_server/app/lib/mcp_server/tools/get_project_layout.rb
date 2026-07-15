# frozen_string_literal: true

class McpServer::Tools::GetProjectLayout < McpServer::BaseTool
  def name = 'get_project_layout'
  def title = 'Get project page layout'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Reads a project's page layout (a craft.js node graph). Returns the raw craftjs_json
      plus an outline listing every node in visual order with its id, widget type, parent,
      slot and a text snippet — use the outline to find the node ids to target with
      update_project_layout. Outline entries marked locked are the fixed page scaffold
      (banner, title, phase timeline, events); the editable content is the subtree of the
      ProjectDescriptionSection node.
    DESC
  end

  def input_schema
    {
      properties: {
        project_id: { type: 'string' }
      },
      required: %w[project_id]
    }
  end

  def output_schema
    {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        outline: McpServer::Serializers::LayoutOutline::JSON_SCHEMA,
        craftjs_json: { type: 'object' }
      },
      required: %w[enabled outline craftjs_json]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      project = Project.find(params[:project_id])
      layout = ContentBuilder::Layout.find_by(
        content_buildable: project,
        code: ContentBuilder::ProjectPageLayoutService::CODE
      )

      # Every project gets a page layout at creation (and a rake task backfilled older
      # ones), so a missing layout is a data anomaly rather than a state to repair here.
      if layout.nil?
        return error(
          "Project #{project.id} has no page layout. It should have been provisioned " \
          'at project creation; this needs fixing outside this tool.'
        )
      end

      authorize(layout, :show?)
      craftjs_json = ContentBuilder::LayoutImageService.new.render_data_images(layout.craftjs_json)

      response(
        "Page layout for project #{project.id}",
        structured: {
          enabled: layout.enabled,
          outline: McpServer::Serializers::LayoutOutline.new(craftjs_json).entries,
          craftjs_json: craftjs_json
        }
      )
    rescue ActiveRecord::RecordNotFound
      not_found_error('Project', params[:project_id])
    end
  end
end
