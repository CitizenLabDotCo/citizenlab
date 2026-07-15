# frozen_string_literal: true

class McpServer::Tools::UpdateProjectLayout < McpServer::BaseTool
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

  # Deliberately compact: MCP clients truncate long tool descriptions, so the full
  # widget/format reference travels in the validation-error responses of this tool.
  def description
    <<~DESC
      Updates a project's page layout (a craft.js node graph) with a sparse patch: send
      ONLY the nodes you are adding or changing (each in its full final form) in `nodes`,
      plus `delete_node_ids` for removals. Never re-send unchanged nodes. The patch is
      merged into the stored graph and validated; on failure nothing is saved and the
      errors (with a widget reference) tell you what to fix.

      ALWAYS call get_project_layout first and copy the exact shape of existing nodes.
      The page scaffold (banner, title, phase timeline, events) is fixed; ALL your content
      lives inside the ProjectDescriptionSection node. Add, remove or reorder top-level
      content by also sending that node with its updated `nodes` array. To change the
      project title or header image use update_project instead.

      Recipes: edit or replace = send just that node (no delete needed). Insert/move = send
      the node (with `parent` set) AND the parent with its updated `nodes` array (order =
      position); when moving between parents also send the old parent without the id.
      Delete = ids in `delete_node_ids` (subtrees and linked slot nodes are removed and
      detached automatically).

      Design: separate sections with WhiteSpace nodes (medium between sections, small within,
      withDivider at strong breaks). Use TwoColumn/ThreeColumn for parallel content,
      AccordionMultiloc (body in its linked Container) for FAQs and concerns, ButtonMultiloc
      for calls to action, AboutBox last. Avoid all-text descriptions. The phase timeline
      and the events list are already on the page — never rebuild them as content.
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
        },
        enabled: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether the page layout is shown. Layouts are enabled by default; leave unset
            to keep the current value.
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
    # Anything wrong with the requested patch itself; the message is the client-facing,
    # correctable error. Nothing is persisted when this is raised.
    PatchError = Class.new(StandardError)

    SCAFFOLD_WIDGETS = McpServer::Tools::LayoutWidgets::SCAFFOLD_WIDGETS
    DESCRIPTION_WIDGET = 'ProjectDescriptionSection'
    # Widgets that render from the project record; their layout props are transient.
    PROJECT_RECORD_WIDGETS = %w[ProjectBanner ProjectTitle].freeze

    def run
      project = Project.find(params[:project_id])
      authorize_project!(project)

      layout = ContentBuilder::Layout.find_by(
        content_buildable: project,
        code: ContentBuilder::ProjectPageLayoutService::CODE
      )
      # Every project gets a page layout at creation (and a rake task backfilled older
      # ones), so a missing layout is a data anomaly rather than a state to repair here.
      if layout.nil?
        return error(
          "Project #{project.id} has no page layout. It should have been provisioned " \
          'at project creation; this needs fixing outside this tool.'
        )
      end

      # Before anything derived from the stored graph can flow into a response.
      authorize(layout, :update?)

      protect_scaffold!(layout.craftjs_json || {})
      graph = patched_graph(layout)
      protect_content_placement!(graph)
      validate!(graph)

      layout.craftjs_json = graph
      # Again with the new graph assigned: the policy's file-attachment check must see
      # the fileIds the patch introduces, not the stored ones.
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

    # The scaffold contract: scaffold nodes may not be deleted, added or edited. The one
    # exception is the description section itself, which a patch may re-send (unmoved)
    # to update its `nodes` — that array IS the page's top-level content.
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

        unless stored.key?(id) && names == [DESCRIPTION_WIDGET]
          raise PatchError, "node #{id}: #{names.join('/')} is part of the fixed page scaffold and " \
                            'cannot be added or edited. The only scaffold node a patch may send is ' \
                            "the existing #{DESCRIPTION_WIDGET} node, to update its `nodes`."
        end

        if node['parent'] != stored[id]['parent']
          raise PatchError, "node #{id}: the #{DESCRIPTION_WIDGET} node cannot be moved."
        end
      end
    end

    # Patched content must land inside the description section: everything else on the
    # page is fixed scaffold the FE will not render children of.
    def protect_content_placement!(graph)
      section_id = graph.keys.find { |id| resolved_name(graph[id]) == DESCRIPTION_WIDGET }
      if section_id.nil?
        raise PatchError, "The stored layout is missing its #{DESCRIPTION_WIDGET} node; " \
                          'this needs fixing outside this tool.'
      end

      patch_nodes.each_key do |id|
        next if scaffold?(graph[id])
        next if inside?(graph, id, section_id)

        raise PatchError, "node #{id}: content must live inside the description section — its " \
                          "parent chain must reach #{section_id} (#{DESCRIPTION_WIDGET}). The rest " \
                          'of the page (banner, title, phases, events) is fixed.'
      end
    end

    def inside?(graph, id, ancestor_id)
      seen = Set.new
      current = graph.dig(id, 'parent')
      while current.is_a?(String) && seen.exclude?(current)
        return true if current == ancestor_id

        seen << current
        current = graph.dig(current, 'parent')
      end
      false
    end

    def scaffold?(node)
      node.is_a?(Hash) && SCAFFOLD_WIDGETS.include?(resolved_name(node))
    end

    def resolved_name(node)
      ContentBuilder::Craftjs::Nodes.resolved_name(node)
    end

    def patched_graph(layout)
      graph = (layout.craftjs_json || {}).deep_dup
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
        widget_specs: McpServer::Tools::LayoutWidgets::VALIDATOR_SPECS,
        root_type: McpServer::Tools::LayoutWidgets::ROOT_TYPE,
        # Widget conventions apply only to the nodes this patch touches, so legacy
        # widgets elsewhere in a stored graph cannot fail an unrelated update.
        convention_scope: patch_nodes.keys
      ).errors
      return if errors.none?

      raise PatchError,
        "Layout NOT saved. Fix these problems and retry:\n" \
        "#{errors.map { |e| "- #{e}" }.join("\n")}\n\n#{McpServer::Tools::LayoutWidgets::CHEATSHEET}"
    end

    def save_layout(layout)
      layout.enabled = params[:enabled] unless params[:enabled].nil?

      side_fx = ContentBuilder::SideFxLayoutService.new
      # The before_ hook imports new images (LayoutImage.create! from imageUrl); the
      # transaction keeps those rows from being orphaned when a later step aborts.
      ActiveRecord::Base.transaction do
        side_fx.before_update(layout, current_user)
        layout.save!
      end
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
