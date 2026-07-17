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
  def title = 'Update project description layout'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: true # Imports ImageMultiloc images from arbitrary public URLs.
    }
  end

  # Deliberately compact: MCP clients truncate long tool descriptions, so the
  # widget/format reference travels in tool RESPONSES instead — the full cheatsheet
  # once, when get_project_layout finds no layout, and only a targeted subset
  # (format rules + docs for the offending widgets) on validation errors, so
  # retries don't accumulate full copies in the client's context.
  def description
    <<~DESC
      Creates or updates a project's description-page layout (a craft.js node graph) with a
      sparse patch: send ONLY the nodes you are adding or changing (each in its full final
      form) in `nodes`, plus `delete_node_ids` for removals. Never re-send unchanged nodes.
      The patch is merged into the stored graph and validated; on failure nothing is saved
      and the errors (with a widget reference) tell you what to fix.

      ALWAYS call get_project_layout first — to copy the exact shape of existing nodes, or,
      when no layout exists, for the format reference to build the complete graph from
      (pass enabled: true when creating).

      Recipes: edit or replace = send just that node (no delete needed). Insert/move = send
      the node (with `parent` set) AND the parent with its updated `nodes` array (order =
      position); when moving between parents also send the old parent without the id.
      Delete = ids in `delete_node_ids` (subtrees and linked slot nodes are removed and
      detached automatically).

      Design: separate sections with WhiteSpace nodes (medium between sections, small within,
      withDivider at strong breaks). Use TwoColumn/ThreeColumn for parallel content,
      AccordionMultiloc (body in its linked Container) for FAQs and concerns, ButtonMultiloc
      for calls to action, AboutBox last. Avoid all-text pages.
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
            Whether the custom layout is shown on the project page. New layouts start
            DISABLED — pass true when creating one, or it will not be visible.
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

    def run
      project = Project.find(params[:project_id])
      authorize_project!(project)

      layout = ContentBuilder::Layout.find_or_initialize_by(
        content_buildable: project,
        code: ContentBuilder::Layout::PROJECT_DESCRIPTION_CODE
      )
      # Before anything derived from the stored graph can flow into a response.
      authorize(layout, :update?)

      graph = patched_graph(layout)
      validate!(graph)

      created = layout.new_record?
      layout.craftjs_json = graph
      # Again with the new graph assigned: the policy's file-attachment check must see
      # the fileIds the patch introduces, not the stored ones.
      authorize(layout, :update?)
      save_layout(layout, created)

      response(
        "#{created ? 'Created' : 'Updated'} description layout for project #{project.id}",
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

    def patched_graph(layout)
      graph = (layout.craftjs_json || {}).deep_dup
      apply_deletes!(graph)
      graph.merge!(patch_nodes)
      graph
    end

    def apply_deletes!(graph)
      return if delete_node_ids.empty?

      if delete_node_ids.include?('ROOT')
        raise PatchError, 'Cannot delete ROOT. To start over, send a complete new graph in `nodes`.'
      end

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
                        'Fix it by sending corrected nodes, or send a complete new graph.'
    end

    def validate!(graph)
      if graph.size > MAX_NODES
        raise PatchError, "Layout NOT saved: the graph would have #{graph.size} nodes, " \
                          "above the maximum of #{MAX_NODES}."
      end

      errors = ContentBuilder::Craftjs::Validator.new(
        graph,
        widget_specs: ContentBuilder::Craftjs::WidgetSpecs::SPECS,
        # Widget conventions apply only to the nodes this patch touches, so legacy
        # widgets elsewhere in a stored graph cannot fail an unrelated update.
        convention_scope: patch_nodes.keys
      ).errors
      return if errors.none?

      raise PatchError,
        "Layout NOT saved. Fix these problems and retry:\n" \
        "#{errors.map { |e| "- #{e}" }.join("\n")}\n\n#{error_reference(errors, graph)}"
    end

    # Docs for just the widgets the errors point at — a full cheatsheet here would
    # add another complete copy to the client's context on every failed retry.
    def error_reference(errors, graph)
      widgets = errors.filter_map do |e|
        e.node_id && ContentBuilder::Craftjs::Query.resolved_name(graph[e.node_id] || {})
      end
      McpServer::Tools::LayoutWidgets.reference_for(widgets)
    end

    def save_layout(layout, created)
      layout.enabled = params[:enabled] unless params[:enabled].nil?

      side_fx = ContentBuilder::SideFxLayoutService.new
      # The before_ hooks import new images (LayoutImage.create! from imageUrl); the
      # transaction keeps those rows from being orphaned when a later step aborts.
      ActiveRecord::Base.transaction do
        created ? side_fx.before_create(layout, current_user) : side_fx.before_update(layout, current_user)
        layout.save!
      end
      created ? side_fx.after_create(layout, current_user) : side_fx.after_update(layout, current_user)
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
