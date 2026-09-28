# frozen_string_literal: true

class McpServer::Tools::UpdateHomepageLayout < McpServer::BaseTool
  # Generous ceiling to bound runaway LLM patches; a rich homepage lands well under this.
  MAX_NODES = 300

  # Permissive shape of a single craftjs node in the patch; the full rules live in
  # ContentBuilder::Craftjs::Validator, which produces correctable error messages.
  NODE_SCHEMA = {
    type: 'object',
    properties: {
      type: {
        oneOf: [
          { type: 'string' },
          { type: 'object', properties: { resolvedName: { type: 'string' } }, required: %w[resolvedName] }
        ]
      },
      parent: { type: 'string' },
      props: { type: 'object' },
      custom: { type: 'object' },
      hidden: { type: 'boolean' },
      isCanvas: { type: 'boolean' },
      displayName: { type: 'string' },
      nodes: { type: 'array', items: { type: 'string' } },
      linkedNodes: { type: 'object', additionalProperties: { type: 'string' } }
    },
    required: %w[type]
  }.freeze

  def name = 'update_homepage_layout'
  def title = 'Update homepage layout'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: true # Imports images from arbitrary public URLs.
    }
  end

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
      ROOT. HomepageBanner and Projects are fixed (they can be edited but not moved or deleted).
      To add or reorder top-level content, also send the ROOT node with only its `nodes` array
      changed (keep the fixed widgets' ids); to remove content use `delete_node_ids`.

      Recipes: edit or replace = send just that node. Insert/move = send the node (with `parent`)
      AND ROOT with its updated `nodes` array. Delete = ids in `delete_node_ids` (subtrees and
      linked slot nodes are removed automatically; never a fixed widget).
    DESC
  end

  def input_schema
    {
      properties: {
        nodes: {
          type: 'object',
          description: <<~DESC.squish,
            Map of node-id to the node's full final JSON, containing only added or changed
            nodes. New nodes need new unique ids (10 chars of [A-Za-z0-9_-]).
          DESC
          additionalProperties: NODE_SCHEMA
        },
        delete_node_ids: {
          type: 'array',
          items: { type: 'string' },
          description: <<~DESC.squish
            Ids of nodes to delete. Subtrees and linked slot nodes are removed and detached
            automatically, so list only the topmost node of what you want gone.
          DESC
        }
      },
      additionalProperties: false
    }
  end

  def output_schema
    {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        outline: McpServer::Serializers::LayoutOutline::JSON_SCHEMA
      },
      required: %w[enabled outline]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    DEMO_ONLY_MESSAGE = 'The homepage layout can only be updated on demo and trial platforms.'

    # Invalid patch: the message is returned to the client and nothing is saved.
    PatchError = Class.new(StandardError)

    delegate :resolved_name, to: :'ContentBuilder::Craftjs::Query', private: true

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

    def patch_nodes
      @patch_nodes ||= params[:nodes].to_h.deep_stringify_keys
    end

    def delete_node_ids
      @delete_node_ids ||= Array(params[:delete_node_ids]).map(&:to_s)
    end

    # The fixed widgets (custom.noDelete) may be edited but not deleted.
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

    def patched_graph(stored)
      graph = stored.deep_dup
      apply_deletes!(graph)
      graph.merge!(patch_nodes)
      graph
    end

    def apply_deletes!(graph)
      return if delete_node_ids.empty?

      overlap = delete_node_ids & patch_nodes.keys
      if overlap.any?
        raise PatchError, "These ids are in both delete_node_ids and nodes: #{overlap.join(', ')}. " \
                          'To replace a node just send it in `nodes`; deleting it too would detach it.'
      end

      missing = delete_node_ids - graph.keys
      if missing.any?
        raise PatchError, "delete_node_ids that do not exist in the layout: #{missing.join(', ')}"
      end

      state = ContentBuilder::Craftjs::State.new(graph)
      delete_node_ids.each do |id|
        # Already removed as part of an earlier id's subtree.
        next unless graph.key?(id)

        state.delete_node(id)
      end
    rescue KeyError => e
      raise PatchError, "The stored layout is inconsistent around a deleted node (#{e.message}). " \
                        'Fix it by sending corrected nodes.'
    end

    def validate!(graph)
      if graph.size > MAX_NODES
        raise PatchError, "Layout NOT saved: the graph would have #{graph.size} nodes, " \
                          "above the maximum of #{MAX_NODES}."
      end

      errors = ContentBuilder::Craftjs::Validator.new(
        graph,
        widget_specs: ContentBuilder::Craftjs::WidgetSpecs::HOMEPAGE_SPECS,
        root_type: 'div',
        # Only the patched nodes must follow widget conventions, so pre-existing nodes
        # cannot fail an unrelated update.
        convention_scope: patch_nodes.keys
      ).errors
      return if errors.none?

      raise PatchError,
        "Layout NOT saved. Fix these problems and retry:\n" \
        "#{errors.map { |e| "- #{e}" }.join("\n")}\n\n#{error_reference(errors, graph)}"
    end

    # Docs for just the widgets the errors point at, to keep retry responses small.
    def error_reference(errors, graph)
      widgets = errors.filter_map { |e| e.node_id && resolved_name(graph[e.node_id] || {}) }
      McpServer::HomepageWidgets.reference_for(widgets)
    end

    def save_layout(layout)
      # Same sequence as ContentBuilderLayoutsController. No transaction: before_update
      # downloads remote images, which should not hold a DB connection.
      side_fx = ContentBuilder::SideFxLayoutService.new
      side_fx.before_update(layout, current_user)
      layout.save!
      side_fx.after_update(layout, current_user)
    end

    def image_import_error(record)
      error(
        "Image import failed: #{record.errors.full_messages.join(', ')}. Check that every " \
        'image node\'s props.image.imageUrl is a publicly reachable image URL. Nothing was saved.'
      )
    end
  end
end
