# frozen_string_literal: true

# Builds a compact, visually-ordered outline of a craftjs_json graph so an LLM can
# find node ids, parents and slots without parsing the raw graph. Traversal comes
# from ContentBuilder::Craftjs::Query.each_visual; this class only formats entries.
class McpServer::Serializers::LayoutOutline
  # JSON schema of #entries, for tools that expose the outline in their output_schema.
  JSON_SCHEMA = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        widget: { type: 'string' },
        parent: { type: 'string', description: 'Absent on ROOT.' },
        depth: { type: 'integer' },
        canvas: { type: 'boolean', description: 'Present (true) when children can be placed inside this node.' },
        locked: { type: 'boolean', description: 'Present (true) on protected nodes that must not be moved or deleted; see the tool\'s widget reference for whether they can be edited.' },
        slot: { type: 'string', description: "The parent's linkedNodes slot this node fills (e.g. left, accordion-content)." },
        text: { type: 'string', description: 'Plain-text snippet of the node text or title.' }
      },
      required: %w[id depth]
    }
  }.freeze

  TEXT_SNIPPET_LENGTH = 120
  private_constant :TEXT_SNIPPET_LENGTH

  # Marks project-page scaffold nodes by widget type — the default, so callers that
  # don't pass `protected:` keep the project-page behaviour. Based on the widget type,
  # not the custom.locked/region markers the FE writes, so the outline matches what
  # update_project_layout enforces.
  DEFAULT_PROTECTED = lambda do |node|
    ContentBuilder::ProjectPageLayoutService::SCAFFOLD_WIDGETS.include?(
      ContentBuilder::Craftjs::Query.resolved_name(node)
    )
  end

  def initialize(craftjs_json, protected: DEFAULT_PROTECTED)
    @json = craftjs_json
    @protected = protected
  end

  # One entry per node, in visual order; keys with nil values are omitted:
  #   { id:, widget:, parent:, depth:, canvas: true, locked: true, slot:, text: }
  def entries
    ContentBuilder::Craftjs::Query.each_visual(@json).map do |id, node, depth, slot|
      entry(id, node, depth, slot)
    end
  end

  private

  def entry(id, node, depth, slot)
    widget = ContentBuilder::Craftjs::Query.resolved_name(node)
    {
      id: id,
      widget: widget,
      parent: node['parent'],
      depth: depth,
      canvas: node['isCanvas'] ? true : nil,
      locked: @protected.call(node) ? true : nil,
      slot: slot,
      text: text_snippet(node)
    }.compact
  end

  def text_snippet(node)
    props = node['props'].is_a?(Hash) ? node['props'] : {}
    multiloc = props['text'].presence || props['title'].presence
    return nil unless multiloc.is_a?(Hash)

    text = multiloc.values.find { |value| value.is_a?(String) && value.present? }
    return nil if text.nil?

    ActionView::Base.full_sanitizer.sanitize(text).squish.truncate(TEXT_SNIPPET_LENGTH)
  end
end
