# frozen_string_literal: true

class McpServer::Tools::UpdateProjectLayout < McpServer::BaseTool
  def name = 'update_project_layout'
  def title = 'Update project page layout'
  def annotations = McpServer::LayoutPatching::ANNOTATIONS
  def output_schema = McpServer::LayoutPatching::OUTPUT_SCHEMA

  # Kept short: MCP clients truncate long tool descriptions. The widget/format
  # reference is returned in validation-error responses instead.
  def description
    <<~DESC
      Updates a project's page layout (a craft.js node graph) with a sparse patch: send
      ONLY the nodes you are adding or changing (each in its full final form) in `nodes`,
      plus `delete_node_ids` for removals. Never re-send unchanged nodes. The patch is
      merged into the stored graph and validated; on failure nothing is saved and the
      errors (with a widget reference) tell you what to fix.

      ALWAYS call get_project_layout first and copy the exact shape of existing nodes. The
      page scaffold (root, banner, title, body) is fixed; ALL your content lives
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
      EventsList render the project's phases and events wherever you place them in the
      body — reorder or remove them, but never rebuild them as content.
    DESC
  end

  def input_schema
    {
      properties: { project_id: { type: 'string' }, **McpServer::LayoutPatching.node_params },
      required: %w[project_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    include McpServer::LayoutPatchable

    # The fixed page-structure nodes; a patch may not add, edit or delete them.
    SCAFFOLD_WIDGETS = ContentBuilder::ProjectPageLayoutService::SCAFFOLD_WIDGETS
    # The scaffold node holding all page content; its `nodes` array is the top-level order.
    BODY_WIDGET = ContentBuilder::ProjectPageLayoutService::BODY_WIDGET
    # Scaffold widgets rendered from the project record; changed via update_project instead.
    PROJECT_RECORD_WIDGETS = ContentBuilder::ProjectPageLayoutService::PROJECT_RECORD_WIDGETS

    # Fully qualified: a relative constant would not resolve inside delegate's module_eval.
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

    def widget_specs = ContentBuilder::Craftjs::WidgetSpecs::PROJECT_PAGE_SPECS
    def root_type = ContentBuilder::ProjectPageLayoutService::ROOT_TYPE
    def widget_reference(widgets) = McpServer::LayoutWidgets.reference_for(widgets)

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
  end
end
