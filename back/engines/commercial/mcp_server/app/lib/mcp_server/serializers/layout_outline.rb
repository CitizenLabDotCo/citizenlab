# frozen_string_literal: true

# Builds a compact, visually-ordered outline of a craftjs_json graph so an LLM can
# navigate the layout (find node ids, parents and slots) without re-deriving the
# structure from the raw graph. Column widgets are walked left to right, using the
# same slot order as ContentBuilder::Craftjs::VisibleTextualMultilocs.
#
# Stored graphs are not guaranteed to be validated (they can predate
# ContentBuilder::Craftjs::Validator or come from other write paths), so the walk
# must tolerate anything: missing keys, non-string prop values, even cycles.
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
        locked: { type: 'boolean', description: 'Present (true) on canonical page-scaffold nodes that must not be added, moved, deleted or edited.' },
        slot: { type: 'string', description: "The parent's linkedNodes slot this node fills (e.g. left, accordion-content)." },
        text: { type: 'string', description: 'Plain-text snippet of the node text or title.' }
      },
      required: %w[id depth]
    }
  }.freeze

  TEXT_SNIPPET_LENGTH = 120
  private_constant :TEXT_SNIPPET_LENGTH

  def initialize(craftjs_json)
    @json = craftjs_json
    @children_index = build_children_index
  end

  # One entry per node, in visual order. Full entry shape (keys with nil values are
  # omitted, so `parent`/`canvas`/`locked`/`slot`/`text` are only present when meaningful):
  #   { id:, widget:, parent:, depth:, canvas: true, locked: true, slot:, text: }
  def entries
    walk('ROOT', depth: 0, slot: nil, visited: Set.new)
  end

  private

  def walk(id, depth:, slot:, visited:)
    node = @json[id]
    return [] if node.blank? || visited.include?(id)

    visited << id
    [entry(id, node, depth, slot)] + children(id).flat_map do |child_id, child_slot|
      walk(child_id, depth: depth + 1, slot: child_slot, visited: visited)
    end
  end

  def entry(id, node, depth, slot)
    {
      id: id,
      widget: ContentBuilder::Craftjs::Nodes.resolved_name(node),
      parent: node['parent'],
      depth: depth,
      canvas: node['isCanvas'] ? true : nil,
      locked: locked?(node) ? true : nil,
      slot: slot,
      text: text_snippet(node)
    }.compact
  end

  # The FE marks the fixed page-scaffold nodes with custom.locked (widgets pinned in
  # place) or custom.region (structural canvases); both are off-limits to edits.
  def locked?(node)
    custom = node['custom']
    custom.is_a?(Hash) && (custom['locked'] || custom['region']) ? true : false
  end

  # @return [Array<[String, String|nil]>] ordered pairs of [child id, slot name]
  def children(id)
    @children_index.fetch(id, [])
  end

  # Precomputed child lists: the parent's `nodes` order first (nodes claiming this
  # parent but missing from that array are appended, defensively), then linkedNodes
  # slots in visual order.
  def build_children_index
    claimed = Hash.new { |hash, key| hash[key] = [] }
    @json.each do |id, node|
      claimed[node['parent']] << id if node.is_a?(Hash) && node['parent'].is_a?(String)
    end

    @json.to_h do |id, node|
      next [id, []] unless node.is_a?(Hash)

      linked = (node['linkedNodes'] || {}).values
      listed = node['nodes'] || []
      ordered = (claimed[id] - linked).sort_by { |key| listed.index(key) || Float::INFINITY }
      slots = ContentBuilder::Craftjs::Nodes.ordered_slots(node)

      [id, ordered.map { |child_id| [child_id, nil] } + slots.map { |slot| [node['linkedNodes'][slot], slot] }]
    end
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
