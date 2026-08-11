# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Read-only access to a craftjs graph: node facts and traversal. The read
    # counterpart of State, which mutates a graph (the naming mirrors craft.js).
    # All graph readers should use these instead of re-deriving node facts.
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

      # All child ids of a node, in child_references order.
      # @return [Array<String>]
      def child_ids(node)
        child_references(node).map { |_via, child_id| child_id }
      end

      # linkedNodes slot names in visual order: the slots declared in WidgetSpecs
      # first, then any undeclared slots a stored graph carries.
      # @return [Array<String>]
      def ordered_slots(node)
        linked_nodes = node['linkedNodes'] || {}
        declared = WidgetSpecs::SPECS.dig(resolved_name(node), 'slots') || []
        declared.select { |slot| linked_nodes.key?(slot) } + (linked_nodes.keys - declared)
      end

      # Walks the graph in visual order (`nodes` children top to bottom, then
      # linkedNodes slots left to right), yielding (id, node, depth, slot); slot is
      # nil for ordinary children. Starts at ROOT, or at `from` to walk one subtree.
      #
      # Lenient, since stored graphs may predate validation: missing nodes are skipped,
      # cycles are cut, and nodes missing from their parent's `nodes` array are still
      # visited. The Validator must not use this walk — it audits the very edges this
      # walk papers over.
      def each_visual(graph, from: 'ROOT')
        return enum_for(:each_visual, graph, from: from) unless block_given?

        children = visual_children_index(graph)
        visited = Set.new
        stack = [[from, 0, nil]]
        until stack.empty?
          id, depth, slot = stack.pop
          node = graph[id]
          next if node.blank? || visited.include?(id)

          visited << id
          yield id, node, depth, slot
          stack.concat(children.fetch(id, []).reverse.map { |child_id, child_slot| [child_id, depth + 1, child_slot] })
        end
      end

      # The ids of `id` and everything below it, by the same lenient walk as each_visual.
      # @return [Set<String>]
      def subtree_ids(graph, id)
        each_visual(graph, from: id).to_set { |node_id, _node, _depth, _slot| node_id }
      end

      # Child lists for each_visual, precomputed in one pass: `nodes` children in
      # stored order first, then linkedNodes slots in visual order.
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
