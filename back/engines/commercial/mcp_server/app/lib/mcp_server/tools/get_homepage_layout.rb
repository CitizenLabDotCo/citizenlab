# frozen_string_literal: true

class McpServer::Tools::GetHomepageLayout < McpServer::BaseTool
  def name = 'get_homepage_layout'
  def title = 'Get homepage layout'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Reads the platform homepage layout (a craft.js node graph). Returns the raw craftjs_json
      plus an outline listing every node in visual order with its id, widget type, parent,
      slot and a text snippet — use the outline to find the node ids to target with
      update_homepage_layout. Outline entries marked locked are the fixed homepage widgets
      (HomepageBanner, Projects): they can be edited but not moved or deleted.
    DESC
  end

  def input_schema = { properties: {}, additionalProperties: false }

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
      layout = ContentBuilder::Layout.find_by(content_buildable: nil, code: ContentBuilder::Layout::HOMEPAGE_CODE)
      if layout.nil?
        ErrorReporter.report_msg('Homepage layout is missing')
        return error('This platform has no homepage layout; this needs fixing outside this tool.')
      end

      authorize(layout, :show?)
      craftjs_json = ContentBuilder::LayoutImageService.new.render_data_images(layout.craftjs_json)

      response(
        'Homepage layout',
        structured: {
          enabled: layout.enabled,
          outline: McpServer::Serializers::LayoutOutline.new(
            craftjs_json, protected: McpServer::HomepageWidgets.method(:protected?)
          ).entries,
          craftjs_json: craftjs_json
        }
      )
    end
  end
end
