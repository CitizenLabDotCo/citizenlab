# frozen_string_literal: true

class McpServer::Tools::UpdateProjectLayout < McpServer::BaseTool
  # Generous ceiling to bound runaway LLM patches; a rich page lands around 30-40 nodes.
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

  def name = 'update_project_layout'
  def title = 'Update project page layout'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: true # Imports ImageMultiloc images from arbitrary public URLs.
    }
  end

  # Kept short: MCP clients truncate long tool descriptions. The widget/format
  # reference is returned in validation-error responses instead.
  def description
    <<~DESC
      Updates a project's page layout (a craft.js node graph) with a sparse patch: send
      ONLY the nodes you are adding or changing (each in its full final form) in `nodes`,
      plus `delete_node_ids` for removals. Never re-send unchanged nodes. The patch is
      merged into the stored graph and validated; on failure nothing is saved and the
      errors (with a widget reference) tell you what to fix.

      ALWAYS call get_project_layout first and copy the exact shape of existing nodes.
      The page scaffold (root, banner, title, body) is fixed; ALL your content lives
      inside the ProjectPageBody node. To add or reorder top-level content, also send
      that node with only its `nodes` array changed and everything else identical; to
      remove top-level content use `delete_node_ids`. To change the project title or
      header image use update_project instead.

      Recipes: edit or replace = send just that node (no delete needed). Insert/move = send
      the node (with `parent` set) AND the parent with its updated `nodes` array (order =
      position); when moving between parents also send the old parent without the id.
      Delete = ids in `delete_node_ids` (subtrees and linked slot nodes are removed and
      detached automatically).

      Design: separate sections with WhiteSpace nodes (medium between sections, small within,
      withDivider at strong breaks). Use TwoColumn/ThreeColumn for parallel content,
      AccordionMultiloc (body in its linked Container) for FAQs and concerns, ButtonMultiloc
      for calls to action, AboutBox near the end. Avoid all-text pages. PhasesWidget and
      EventsWidget render the project's phases and events wherever you place them in the
      body — reorder or remove them, but never rebuild them as content.
    DESC
  end

  def input_schema
    {
      properties: {
        project_id: { type: 'string' },
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
      required: %w[project_id]
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
    # Invalid patch: the message is returned to the client and nothing is saved.
    PatchError = Class.new(StandardError)

    # The fixed page-structure nodes; a patch may not add, edit or delete them.
    SCAFFOLD_WIDGETS = ContentBuilder::ProjectPageLayoutService::SCAFFOLD_WIDGETS
    # The scaffold node holding all page content; its `nodes` array is the top-level order.
    BODY_WIDGET = ContentBuilder::ProjectPageLayoutService::BODY_WIDGET
    # Scaffold widgets rendered from the project record; changed via update_project instead.
    PROJECT_RECORD_WIDGETS = ContentBuilder::ProjectPageLayoutService::PROJECT_RECORD_WIDGETS

    # Fully qualified: relative constants would not resolve inside delegate's module_eval.
    delegate :resolved_name, to: :'ContentBuilder::Craftjs::Query', private: true
    delegate :scaffold?, to: :'ContentBuilder::ProjectPageLayoutService', private: true

    def run
      project = Project.find(params[:project_id])
      authorize_project!(project)

      layout = ContentBuilder::Layout.find_by(
        content_buildable: project,
        code: ContentBuilder::ProjectPageLayoutService::CODE
      )
      # There should always be a page layout, but covering just in case.
      if layout.nil?
        ErrorReporter.report_msg('Project page layout is missing', extra: { project_id: project.id })
        return error(
          "Project #{project.id} has no page layout. It should have been provisioned " \
          'at project creation; this needs fixing outside this tool.'
        )
      end

      # Authorize before any stored-graph data can flow into a response.
      authorize(layout, :update?)

      stored = layout.craftjs_json || {}
      protect_scaffold!(stored)
      protect_legacy_widgets!(stored)
      graph = patched_graph(stored)
      protect_content_placement!(graph)
      validate!(graph)

      layout.craftjs_json = graph
      # Re-authorize with the new graph: the policy must see the fileIds the patch introduces.
      authorize(layout, :update?)
      save_layout(layout)

      response(
        "Updated page layout for project #{project.id}",
        structured: {
          enabled: layout.enabled,
          outline: McpServer::Serializers::LayoutOutline.new(layout.craftjs_json).entries
        }
      )
    rescue PatchError => e
      error(e.message)
    rescue ActiveRecord::RecordNotFound
      not_found_error('Project', params[:project_id])
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

    # Scaffold nodes may not be deleted, added or edited. The one exception is the
    # body node's `nodes` array, which is the page's top-level content.
    def protect_scaffold!(stored)
      deleted = delete_node_ids.find { |id| scaffold?(stored[id]) }
      if deleted
        raise PatchError, "node #{deleted}: #{resolved_name(stored[deleted])} is part of the fixed " \
                          'page scaffold and cannot be deleted.'
      end

      patch_nodes.each do |id, node|
        names = [stored[id], node].compact.map { |n| resolved_name(n) }.uniq
        next unless names.intersect?(SCAFFOLD_WIDGETS)

        if names.intersect?(PROJECT_RECORD_WIDGETS)
          raise PatchError, "node #{id}: the project title and header image are project attributes, " \
                            'not layout content. Change them with the update_project tool ' \
                            '(title_multiloc / remote_header_bg_url).'
        end

        unless stored.key?(id) && names == [BODY_WIDGET]
          raise PatchError, "node #{id}: #{names.join('/')} is part of the fixed page scaffold and " \
                            'cannot be added or edited. The only scaffold node a patch may send is ' \
                            "the existing #{BODY_WIDGET} node, to update its `nodes`."
        end

        # Only the body's `nodes` array may change; every other key must come back unchanged.
        changed = (stored[id].keys | node.keys).excluding('nodes').reject { |key| stored[id][key] == node[key] }
        next if changed.none?

        raise PatchError, "node #{id}: only the `nodes` array of the #{BODY_WIDGET} node may " \
                          "change, but this patch also changes: #{changed.join(', ')}. Re-send the " \
                          'node exactly as get_project_layout returned it, with only `nodes` edited.'
      end
    end

    # Legacy node types may be edited or deleted where they already exist, but never
    # created — also not by reusing the id of some other existing node.
    def protect_legacy_widgets!(stored)
      patch_nodes.each do |id, node|
        widget = resolved_name(node)
        alternative = McpServer::LayoutWidgets::LEGACY_ALTERNATIVES[widget]
        next if alternative.nil?
        next if stored[id] && resolved_name(stored[id]) == widget

        raise PatchError, "node #{id}: #{widget} is a legacy node type kept only for pages that " \
                          "already contain one; new ones cannot be created — #{alternative}."
      end
    end

    # Patched content must live inside the body subtree; the FE does not render
    # children of the other scaffold nodes.
    def protect_content_placement!(graph)
      body_id = graph.keys.find { |id| resolved_name(graph[id]) == BODY_WIDGET }
      if body_id.nil?
        raise PatchError, "The stored layout is missing its #{BODY_WIDGET} node; " \
                          'this needs fixing outside this tool.'
      end

      inside = ContentBuilder::Craftjs::Query.subtree_ids(graph, body_id)
      outside = patch_nodes.keys.reject { |id| inside.include?(id) || scaffold?(graph[id]) }
      return if outside.none?

      raise PatchError, "nodes #{outside.join(', ')}: content must live inside the page body — " \
                        "the parent chain must reach #{body_id} (#{BODY_WIDGET}). The rest of " \
                        'the page is fixed scaffold.'
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
        widget_specs: ContentBuilder::Craftjs::WidgetSpecs::SPECS,
        root_type: ContentBuilder::ProjectPageLayoutService::ROOT_TYPE,
        # Only the patched nodes must follow widget conventions, so pre-existing
        # legacy nodes cannot fail an unrelated update.
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
      McpServer::LayoutWidgets.reference_for(widgets)
    end

    # Deliberately no way to set `enabled`: disabling hides the whole page, with no
    # admin UI to notice or undo it.
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
        "ImageMultiloc node's props.image.imageUrl is a publicly reachable image URL. " \
        'Nothing was saved.'
      )
    end
  end
end
