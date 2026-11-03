# frozen_string_literal: true

# Shared tool-definition fragments for the layout-editing MCP tools (update_project_layout,
# update_homepage_layout): the input node schema, annotations and output schema. The mechanical
# patch/validate/save core lives in McpServer::LayoutPatchable, mixed into each tool's Runner.
module McpServer::LayoutPatching
  # Generous ceiling to bound runaway LLM patches; a rich page lands well under this.
  MAX_NODES = 300

  # Permissive shape of a single craftjs node in a patch; the full rules live in
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

  ANNOTATIONS = {
    read_only_hint: false,
    destructive_hint: true,
    idempotent_hint: true,
    open_world_hint: true # Imports images from arbitrary public URLs.
  }.freeze

  OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
      enabled: { type: 'boolean' },
      outline: McpServer::Serializers::LayoutOutline::JSON_SCHEMA
    },
    required: %w[enabled outline]
  }.freeze

  # The shared `nodes` + `delete_node_ids` input properties; tools merge in their own extras.
  def self.node_params
    {
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
    }
  end
end
