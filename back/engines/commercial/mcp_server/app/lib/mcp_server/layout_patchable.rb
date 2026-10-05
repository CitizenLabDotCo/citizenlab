# frozen_string_literal: true

# Mechanical patch/validate/save core shared by the layout-editing MCP tools, mixed into each
# tool's Runner with `include McpServer::LayoutPatchable`. The per-tool differences — lookup,
# authorization and the guard passes — stay in each tool, as does the widget catalogue: a host
# Runner must implement #widget_specs, #root_type and #widget_reference(widgets).
module McpServer::LayoutPatchable
  # Invalid patch: the message is returned to the client and nothing is saved.
  PatchError = Class.new(StandardError)

  private

  def resolved_name(node)
    ContentBuilder::Craftjs::Query.resolved_name(node)
  end

  def patch_nodes
    @patch_nodes ||= params[:nodes].to_h.deep_stringify_keys
  end

  def delete_node_ids
    @delete_node_ids ||= Array(params[:delete_node_ids]).map(&:to_s)
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
      next unless graph.key?(id) # Already removed as part of an earlier id's subtree.

      state.delete_node(id)
    end
  rescue KeyError => e
    raise PatchError, "The stored layout is inconsistent around a deleted node (#{e.message}). " \
                      'Fix it by sending corrected nodes.'
  end

  # Validates the merged graph against the host tool's widget rules; raises PatchError with
  # correctable messages (plus a widget reference) so nothing is saved on failure.
  def validate!(graph)
    max = McpServer::LayoutPatching::MAX_NODES
    if graph.size > max
      raise PatchError, "Layout NOT saved: the graph would have #{graph.size} nodes, above the maximum of #{max}."
    end

    errors = ContentBuilder::Craftjs::Validator.new(
      graph,
      widget_specs: widget_specs,
      root_type: root_type,
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
    widget_reference(widgets)
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
      "image node's props.image.imageUrl is a publicly reachable image URL. Nothing was saved."
    )
  end
end
