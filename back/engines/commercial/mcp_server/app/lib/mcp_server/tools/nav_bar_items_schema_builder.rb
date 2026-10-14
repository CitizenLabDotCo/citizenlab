# frozen_string_literal: true

# Builds the JSON Schema for navbar items. get_nav_bar_items (output) and
# replace_nav_bar_items (input) use the same schema, so a fetched menu can be
# edited and sent back as-is. Keys marked `readOnly: true` are set by the
# server and ignored when sent back.
class McpServer::Tools::NavBarItemsSchemaBuilder
  def item_schema
    @item_schema ||= {
      type: 'object',
      properties: {
        **shared_properties,
        code: {
          type: 'string',
          enum: NavBarItem::CODES,
          description: <<~DESC.squish
            'home', 'projects', 'events' and 'all_input' are the built-in items; they take
            no target and no children, and their default title can be overridden with
            title_multiloc. Omit for custom items ('custom' is the default).
          DESC
        },
        children: {
          type: 'array',
          description: <<~DESC.squish,
            Makes the item a dropdown menu: a title-only parent whose children each link
            to one target. A dropdown takes no target of its own, and dropdowns cannot
            nest.
          DESC
          items: child_schema
        }
      },
      additionalProperties: false
    }
  end

  def child_schema
    @child_schema ||= {
      type: 'object',
      properties: shared_properties,
      additionalProperties: false
    }
  end

  private

  def shared_properties
    @shared_properties ||= {
      id: {
        type: 'string',
        readOnly: true,
        description: 'UUID. Server-assigned; items are recreated on every replace.'
      },
      ordering: {
        type: 'integer',
        readOnly: true,
        description: 'Position, derived from array order.'
      },
      slug: {
        type: %w[string null],
        readOnly: true,
        description: "The target's slug; null for built-in items and dropdowns."
      },
      title_multiloc: {
        type: 'object',
        additionalProperties: { type: 'string' },
        description: <<~DESC.squish
          Localized label. An object mapping locale codes to their translations. Omit it
          to fall back to the target's (or built-in item's) own title. Keep labels at most
          25 characters: the admin UI enforces that length and the navbar truncates longer
          ones.
        DESC
      },
      static_page_id: {
        type: %w[string null],
        description: 'ID of the custom page the item links to. Use list_custom_pages to find valid IDs.'
      },
      project_id: {
        type: %w[string null],
        description: 'ID of the project the item links to. Use list_projects to find valid IDs.'
      },
      project_folder_id: {
        type: %w[string null],
        description: 'ID of the folder the item links to. Use list_folders to find valid IDs.'
      }
    }
  end
end
