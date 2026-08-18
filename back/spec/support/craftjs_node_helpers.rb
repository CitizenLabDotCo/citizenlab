# frozen_string_literal: true

# Builders for craft.js node fixtures, shared by the content_builder and mcp_server
# specs, so every spec builds graphs with the canonical key set the FE editor writes.
module CraftjsNodeHelpers
  # The ROOT document node. `props` defaults to the frame id the FE content builder writes.
  def craftjs_root(children_ids = [], props: { 'id' => 'e2e-content-builder-frame' }, **overrides)
    {
      'type' => 'div',
      'nodes' => children_ids,
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'isCanvas' => true,
      'displayName' => 'div',
      'linkedNodes' => {}
    }.merge(overrides.transform_keys(&:to_s))
  end

  # A project page graph in its persisted shape: the canonical scaffold (as seeded by
  # ContentBuilder::ProjectPageLayoutService) plus the given content nodes. Content nodes
  # whose parent is the page body are listed as its children, before the seeded phases
  # and events widgets.
  def project_page_craftjs(content = {})
    scaffold = ContentBuilder::ProjectPageLayoutService.new.craftjs_json_from_body({})
    body_id = ContentBuilder::ProjectPageLayoutService::BODY_ID
    body = scaffold[body_id]
    top_level = content.select { |_id, node| node['parent'] == body_id }.keys
    scaffold[body_id] = body.merge('nodes' => top_level + body['nodes'])
    scaffold.merge(content)
  end

  # A widget node with the full canonical key set. `widget` is the resolvedName;
  # override any canonical key by its craftjs name (e.g. `isCanvas: true`,
  # `props: { 'text' => { 'en' => '<p>Hi</p>' } }`, `linkedNodes: { 'left' => 'C1' }`).
  def craftjs_node(widget, parent:, **overrides)
    {
      'type' => { 'resolvedName' => widget },
      'nodes' => [],
      'props' => {},
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => false,
      'displayName' => widget,
      'linkedNodes' => {}
    }.merge(overrides.transform_keys(&:to_s))
  end
end

RSpec.configure do |config|
  config.include CraftjsNodeHelpers
end
