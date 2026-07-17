# frozen_string_literal: true

class McpServer::Tools::GetProjectLayout < McpServer::BaseTool
  def name = 'get_project_layout'
  def title = 'Get project description layout'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Reads a project's description-page layout (a craft.js node graph). Returns the raw
      craftjs_json plus an outline listing every node in visual order with its id, widget
      type, parent, slot and a text snippet — use the outline to find the node ids to
      target with update_project_layout. Returns exists: false plus a format_guide when the
      project has no custom layout yet (create one by calling update_project_layout with a
      full node graph).
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
        exists: { type: 'boolean' },
        format_guide: { type: 'string', description: 'The craftjs format and widget reference. Only when exists is false.' },
        enabled: { type: 'boolean' },
        outline: McpServer::Serializers::LayoutOutline::JSON_SCHEMA,
        craftjs_json: { type: 'object' }
      },
      required: %w[exists]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      project = Project.find(params[:project_id])
      layout = ContentBuilder::Layout.find_by(
        content_buildable: project,
        code: ContentBuilder::Layout::PROJECT_DESCRIPTION_CODE
      )

      if layout.nil?
        return response(
          "Project #{project.id} has no custom description layout. To create one, follow " \
          'the format guide below and send the complete graph to update_project_layout ' \
          'with enabled: true.',
          structured: { exists: false, format_guide: McpServer::LayoutWidgets::CHEATSHEET }
        )
      end

      authorize(layout, :show?)
      craftjs_json = ContentBuilder::LayoutImageService.new.render_data_images(layout.craftjs_json)

      response(
        "Description layout for project #{project.id}",
        structured: {
          exists: true,
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
