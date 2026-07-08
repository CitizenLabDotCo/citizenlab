# frozen_string_literal: true

module ContentBuilder
  module Craftjs
    # Shared helpers for reading craftjs nodes. Every consumer that walks a graph
    # (Validator, VisibleTextualMultilocs, the MCP layout outline) must use these
    # instead of re-deriving node facts, so the interpretations cannot drift.
    module Nodes
      # Widgets whose linkedNodes slots have a visual left-to-right order.
      VISUAL_SLOT_ORDER = {
        'TwoColumn' => %w[left right],
        'ThreeColumn' => %w[column1 column2 column3]
      }.freeze

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

      # linkedNodes slot names in visual order, for widgets where that order matters.
      # @return [Array<String>]
      def ordered_slots(node)
        linked_nodes = node['linkedNodes'] || {}
        VISUAL_SLOT_ORDER.fetch(resolved_name(node)) { linked_nodes.keys }
          .select { |slot| linked_nodes.key?(slot) }
      end
    end
  end
end
