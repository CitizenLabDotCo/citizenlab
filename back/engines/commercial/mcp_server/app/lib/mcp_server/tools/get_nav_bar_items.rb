# frozen_string_literal: true

class McpServer::Tools::GetNavBarItems < McpServer::BaseTool
  def name = 'get_nav_bar_items'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC
      Returns the platform's navigation bar items in display order: built-in items (home,
      projects, events, all_input), custom items linking to a static page, project or
      folder, and dropdown items with their children.

      The response shape matches what `replace_nav_bar_items` accepts, so you can
      round-trip: fetch → edit → replace.
    DESC
  end

  def input_schema
    {
      properties: {},
      additionalProperties: false
    }
  end

  def output_schema
    {
      type: 'object',
      properties: {
        items: { type: 'array', items: McpServer::Tools::NavBarItemsSchemaBuilder.new.item_schema },
        nav_last_updated_at: {
          type: %w[string null],
          description: <<~DESC.squish
            Stale-data guard. Pass back to `replace_nav_bar_items` to abort if anyone else
            modified the navbar in the meantime.
          DESC
        }
      },
      required: %w[items]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    include McpServer::Tools::NavBarItemsResponse

    def run
      nav_bar_items_response('Found %<count>s navbar item(s)')
    end
  end
end
