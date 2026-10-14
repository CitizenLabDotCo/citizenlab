# frozen_string_literal: true

class McpServer::Tools::ReplaceNavBarItems < McpServer::BaseTool
  DEMO_ONLY_MESSAGE = 'Replacing navbar items via MCP is only available on demo and trial ' \
                      'platforms. On live platforms, navigation changes stay a human action ' \
                      'in the admin UI.'

  # The admin UI is built around at most 7 top-level items (its MAX_NAVBAR_ITEMS),
  # with the home item locked in first position. The model enforces neither, so the
  # tool does, to never build a menu the admin UI considers broken.
  MAX_TOP_LEVEL_ITEMS = 7

  def name = 'replace_nav_bar_items'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true, # Replaying the same payload rebuilds the same navbar.
      open_world_hint: false
    }
  end

  def description
    <<~DESC
      Replaces the platform's navigation bar with the given items, in array order. The
      items array is the complete new navbar — anything not in it is removed. The first
      item must be the built-in 'home' item, and there can be at most
      #{MAX_TOP_LEVEL_ITEMS} top-level items.

      Item kinds:
      - Built-in: pass its code ('home', 'projects', 'events', 'all_input'); no target.
      - Custom link: exactly one of static_page_id, project_id or project_folder_id.
      - Dropdown: title_multiloc plus children (each child a custom link); no target of
        its own. Dropdowns cannot nest.

      Only available on demo and trial platforms.

      Call `get_nav_bar_items` first to see the current menu, and pass its
      `nav_last_updated_at` back on every call so a concurrent edit of the navbar fails
      this call instead of being overwritten.
    DESC
  end

  def input_schema
    {
      properties: {
        items: {
          type: 'array',
          items: McpServer::Tools::NavBarItemsSchemaBuilder.new.item_schema
        },
        nav_last_updated_at: {
          type: %w[string null],
          description: 'Stale-data guard, as returned by get_nav_bar_items.'
        }
      },
      required: %w[items],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    include McpServer::Tools::NavBarItemsResponse

    TARGET_KEYS = %i[static_page_id project_id project_folder_id].freeze

    def run
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      authorize(NavBarItem, :create?)

      items = params[:items].map(&:deep_symbolize_keys)

      shape_error = items_error(items)
      return error(shape_error) if shape_error

      stale_error = staleness_error
      return error(stale_error) if stale_error

      rebuild!(items)

      nav_bar_items_response('Replaced the navbar: %<count>s top-level item(s)')
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def items_error(items)
      if items.size > MAX_TOP_LEVEL_ITEMS
        return "At most #{MAX_TOP_LEVEL_ITEMS} top-level items are allowed (the navbar and " \
               "its admin UI are built around that cap); got #{items.size}."
      end

      if items.first&.dig(:code) != 'home'
        return "The first item must be the built-in 'home' item; the admin UI locks it in first position."
      end

      items.each_with_index do |entry, index|
        message = entry_error(entry, index)
        return message if message
      end

      nil
    end

    # The schema keeps entries permissive (a oneOf would fail with opaque "no subschema
    # matched" errors), so the three item kinds are told apart and checked here.
    def entry_error(entry, index)
      code = entry[:code] || 'custom'
      target_count = TARGET_KEYS.count { |key| entry[key].present? }
      children = entry[:children].presence

      if code != 'custom'
        return "Item #{index}: built-in '#{code}' items take no target and no children." if target_count > 0 || children

        nil
      elsif children
        return "Item #{index}: a dropdown links to no target of its own; its children carry the targets." if target_count > 0
        return "Item #{index}: a dropdown needs a title_multiloc — it has no target to take a title from." if entry[:title_multiloc].blank?

        children_error(children, index)
      elsif target_count != 1
        "Item #{index}: a custom item needs exactly one of static_page_id, project_id or " \
          'project_folder_id (or children, to make it a dropdown).'
      end
    end

    def children_error(children, index)
      children.each_with_index do |child, child_index|
        target_count = TARGET_KEYS.count { |key| child[key].present? }
        if target_count != 1
          return "Item #{index}, child #{child_index}: exactly one of static_page_id, " \
                 'project_id or project_folder_id is required.'
        end
      end

      nil
    end

    def staleness_error
      return unless params[:nav_last_updated_at]

      sent_at = begin
        Time.zone.parse(params[:nav_last_updated_at])
      rescue ArgumentError
        nil
      end
      return "'#{params[:nav_last_updated_at]}' is not a valid nav_last_updated_at timestamp." unless sent_at

      # Whole-second compare, like replace_form_fields. Known gap: deleting the newest
      # item in the admin UI lowers the maximum, which can let a stale write through —
      # acceptable on a demo/trial-only tool, where the declarative replace is meant to win.
      current_at = NavBarItem.maximum(:updated_at)
      return unless current_at && current_at.to_i > sent_at.to_i

      'The navbar changed since you fetched it. Call get_nav_bar_items again and re-apply your edits.'
    end

    def rebuild!(items)
      side_fx = SideFxNavBarItemService.new

      ActiveRecord::Base.transaction do
        NavBarItem.top_level.each do |item|
          side_fx.before_destroy(item, current_user)
          item.destroy!
          side_fx.after_destroy(item, current_user)
        end

        items.each { |entry| create_item!(entry) }
      end
    end

    # Deliberately not SideFxNavBarItemService#after_create: its auto_reposition! would
    # move re-created built-in items to their canonical positions, overriding the
    # declared array order. Like the web UI, only top-level items are logged.
    def create_item!(entry)
      item = NavBarItem.create!(
        code: entry[:code] || 'custom',
        title_multiloc: entry[:title_multiloc],
        # compact_blank: the shape check counts a blank id as "no target", so writing
        # it would sneak an empty string past the model into a uuid column.
        **entry.slice(*TARGET_KEYS).compact_blank
      )
      LogActivityJob.perform_later(item, 'created', current_user, item.created_at.to_i)

      (entry[:children] || []).each do |child|
        item.children.create!(
          code: 'custom',
          title_multiloc: child[:title_multiloc],
          **child.slice(*TARGET_KEYS).compact_blank
        )
      end
    end
  end
end
