# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Read-only access to a craftjs graph: node facts and traversal. The read
    # counterpart of State (which mutates a graph) — the naming mirrors craft.js,
    # where `query` is the read-only accessor of the editor state. Every consumer
    # that reads a graph (Validator, State, VisibleTextualMultilocs, the MCP layout
    # outline) must use these instead of re-deriving node facts, so the
    # interpretations cannot drift.
    module Query
      module_function

      # @return [String, nil] the widget name: 'type' is either a plain string
      #   ('div' for ROOT) or { 'resolvedName' => <widget> }.
      def resolved_name(node)
        type = node['type']
        type.is_a?(Hash) ? type['resolvedName'] : type
      end

      # All child references of a node, `nodes` first, then linkedNodes slots.
      # @return [Array<[String, String]>] pairs of [reference description, child id]
      def child_references(node)
        (node['nodes'] || []).map { |child_id| ['nodes', child_id] } +
          (node['linkedNodes'] || {}).map { |slot, child_id| ["linkedNodes[#{slot}]", child_id] }
      end

      # linkedNodes slot names in visual order: the widget's declared slots
      # (WidgetSpecs 'slots', in visual order) first, then any undeclared slots a
      # stored graph carries, so lenient readers still visit those.
      # @return [Array<String>]
      def ordered_slots(node)
        linked_nodes = node['linkedNodes'] || {}
        declared = WidgetSpecs::SPECS.dig(resolved_name(node), 'slots') || []
        declared.select { |slot| linked_nodes.key?(slot) } + (linked_nodes.keys - declared)
      end

      # Walks the graph from ROOT in visual order — `nodes` children top to bottom,
      # then linkedNodes slots left to right — yielding (id, node, depth, slot);
      # slot is the parent's linkedNodes slot name, nil for ordinary children.
      #
      # Lenient by design, for readers of stored graphs that may predate validation:
      # missing nodes are skipped, cycles are cut, and nodes claiming a parent without
      # appearing in its `nodes` array are still visited (appended after listed ones).
      # The Validator must NOT use this walk — it audits the very edges this walk
      # papers over, so it works from child_references directly.
      def each_visual(graph)
        return enum_for(:each_visual, graph) unless block_given?

        children = visual_children_index(graph)
        visited = Set.new
        stack = [['ROOT', 0, nil]]
        until stack.empty?
          id, depth, slot = stack.pop
          node = graph[id]
          next if node.blank? || visited.include?(id)

          visited << id
          yield id, node, depth, slot
          stack.concat(children.fetch(id, []).reverse.map { |child_id, child_slot| [child_id, depth + 1, child_slot] })
        end
      end

      # Child lists for each_visual, precomputed in one pass: the parent's `nodes`
      # order first (nodes claiming this parent but missing from that array are
      # appended, defensively), then linkedNodes slots in visual order.
      # @return [Hash{String => Array<[String, String|nil]>}] id => [child id, slot name] pairs
      def visual_children_index(graph)
        claimed = Hash.new { |hash, key| hash[key] = [] }
        graph.each do |id, node|
          claimed[node['parent']] << id if node.is_a?(Hash) && node['parent'].is_a?(String)
        end

        graph.to_h do |id, node|
          next [id, []] unless node.is_a?(Hash)

          linked = (node['linkedNodes'] || {}).values
          listed = node['nodes'] || []
          ordered = (claimed[id] - linked).sort_by { |key| listed.index(key) || Float::INFINITY }
          slots = ordered_slots(node)

          [id, ordered.map { |child_id| [child_id, nil] } + slots.map { |slot| [node['linkedNodes'][slot], slot] }]
        end
      end
    end
  end
end
