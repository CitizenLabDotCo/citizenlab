# frozen_string_literal: true

class McpServer::Tools::UpdateHomepageLayout < McpServer::BaseTool
  def name = 'update_homepage_layout'
  def title = 'Update homepage layout'
  def annotations = McpServer::LayoutPatching::ANNOTATIONS
  def output_schema = McpServer::LayoutPatching::OUTPUT_SCHEMA

  # Kept short: MCP clients truncate long tool descriptions. The widget/format reference is
  # returned in validation-error responses instead.
  def description
    <<~DESC
      Updates the platform homepage layout (a craft.js node graph) with a sparse patch: send
      ONLY the nodes you are adding or changing (each in its full final form) in `nodes`, plus
      `delete_node_ids` for removals. Never re-send unchanged nodes. The patch is merged into the
      stored graph and validated; on failure nothing is saved and the errors (with a widget
      reference) tell you what to fix. Only available on demo and trial platforms.

      ALWAYS call get_homepage_layout first and copy the exact shape of existing nodes. The
      homepage ROOT is a plain container with NO body node — all content lives directly under
      ROOT. The HomepageBanner is fixed (it can be edited but not moved or deleted); some
      homepages mark other widgets fixed too — the outline flags every fixed node with locked.
      To add or reorder top-level content, also send the ROOT node with only its `nodes` array
      changed (keep the fixed widgets' ids); to remove content use `delete_node_ids`.

      Recipes: edit or replace = send just that node. Insert/move = send the node (with `parent`)
      AND ROOT with its updated `nodes` array. Delete = ids in `delete_node_ids` (subtrees and
      linked slot nodes are removed automatically; never a fixed widget).
    DESC
  end

  def input_schema
    { properties: McpServer::LayoutPatching.node_params, additionalProperties: false }
  end

  class Runner < McpServer::BaseTool::Runner
    include McpServer::LayoutPatchable

    DEMO_ONLY_MESSAGE = 'The homepage layout can only be updated on demo and trial platforms.'

    def run
      return error(DEMO_ONLY_MESSAGE) unless published_writable_platform?

      layout = ContentBuilder::Layout.find_by(content_buildable: nil, code: ContentBuilder::Layout::HOMEPAGE_CODE)
      if layout.nil?
        ErrorReporter.report_msg('Homepage layout is missing')
        return error('This platform has no homepage layout; this needs fixing outside this tool.')
      end

      authorize(layout, :update?)

      stored = layout.craftjs_json || {}
      protect_fixed_widgets!(stored)
      graph = patched_graph(stored)
      preserve_no_delete!(stored, graph)
      validate!(graph)

      layout.craftjs_json = graph
      # Re-authorize with the new graph: the policy must see the fileIds the patch introduces.
      authorize(layout, :update?)
      save_layout(layout)

      response(
        'Updated homepage layout',
        structured: {
          enabled: layout.enabled,
          outline: McpServer::Serializers::LayoutOutline.new(
            layout.craftjs_json, protected: McpServer::HomepageWidgets.method(:protected?)
          ).entries
        }
      )
    rescue PatchError => e
      error(e.message)
    rescue ActiveRecord::RecordInvalid => e
      e.record.is_a?(ContentBuilder::LayoutImage) ? image_import_error(e.record) : invalid_record_error(e.record)
    end

    private

    def widget_specs = ContentBuilder::Craftjs::WidgetSpecs::HOMEPAGE_SPECS
    def root_type = 'div'
    def widget_reference(widgets) = McpServer::HomepageWidgets.reference_for(widgets)

    # The homepage banner is fixed by type and any node marked custom.noDelete; either may be
    # edited but not deleted.
    def protect_fixed_widgets!(stored)
      deleted = delete_node_ids.find { |id| McpServer::HomepageWidgets.protected?(stored[id]) }
      return unless deleted

      raise PatchError, "node #{deleted}: #{resolved_name(stored[deleted])} is a fixed homepage " \
                        'widget and cannot be deleted (you can edit it, but not remove it).'
    end

    # Keep an explicit custom.noDelete marker so an edit can't strip a node's only protection
    # and enable a later delete. The banner is protected by type regardless, so it needs no
    # re-assertion. Detaching a node from ROOT is already caught by the validator (unreferenced).
    def preserve_no_delete!(stored, graph)
      stored.each do |id, node|
        next unless node.dig('custom', 'noDelete') == true && graph.key?(id)

        graph[id]['custom'] ||= {}
        graph[id]['custom']['noDelete'] = true
      end
    end
  end
end
