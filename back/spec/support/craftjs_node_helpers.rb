# frozen_string_literal: true

# Builders for canonical craft.js node fixtures. Shared by the content_builder and
# mcp_server specs (this file is loaded by the main rails_helper's spec/support glob,
# which engine specs also go through), so every spec builds graphs with the same
# canonical key set and cannot drift from the shape the FE editor writes.
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
  # ContentBuilder::ProjectPageLayoutService) plus the given content nodes. Content
  # nodes whose parent is the description section are listed as its children.
  def project_page_craftjs(content = {})
    scaffold = ContentBuilder::ProjectPageLayoutService.new.from_description_multiloc({})
    section_id = ContentBuilder::ProjectPageLayoutService::DESCRIPTION_ID
    top_level = content.select { |_id, node| node['parent'] == section_id }.keys
    scaffold[section_id] = scaffold[section_id].merge('nodes' => top_level)
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
