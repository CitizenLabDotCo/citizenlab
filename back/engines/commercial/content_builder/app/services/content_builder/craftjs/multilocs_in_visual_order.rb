module ContentBuilder
  module Craftjs
    # Extracts multilocs from a craftjs in the order they appear in the visual layout.
    class MultilocsInVisualOrder
      def initialize(craftjs)
        @craftjs = craftjs
        @ordered_multilocs = []
      end

      # Orders multlics found in the craftjs by how they appear in the layout,
      # so that columns are ordered from left to right, and texts from top to bottom within each column.
      # Top to bottom ordering within containers is also respected.
      def extract
        multiloc_search_recursive('ROOT')
        @ordered_multilocs
      end

      private

      def multiloc_search_recursive(node_key)
        node = @craftjs[node_key]
        return if node.blank?

        take_multiloc(node)

        resolved_name = node['type']['resolvedName']

        children = if resolved_name == 'TwoColumn'
          [node['linkedNodes']['left'], node['linkedNodes']['right']]
        elsif resolved_name == 'ThreeColumn'
          [node['linkedNodes']['column1'], node['linkedNodes']['column2'], node['linkedNodes']['column3']]
        end

        children = children_ordered_by_nodes_order(node_key, node) if children.nil? || children.compact == []

        children.each { |child_key| multiloc_search_recursive(child_key) } if children.present?
      end

      # Maybe we don't want the accordian multilocs, as they may be be more likely to be non-sequiturs?
      # Alternatively, we could include the node type in the array, and filter it out later as desired.
      # e.g. we could return [{type: 'TextMultiloc', text: 'Hello'}, {type: 'AccordionMultiloc', title: 'Accordion', text: 'World'}, ...]
      # instead of just the multilocs themselves.
      def take_multiloc(node)
        return unless %w[TextMultiloc AccordionMultiloc].include? node['type']['resolvedName']
        
        @ordered_multilocs << node['props']['title'] if node['type']['resolvedName'] == 'AccordionMultiloc'
        @ordered_multilocs << node['props']['text']
      end

      def children_ordered_by_nodes_order(node_key, node)
        # Sort keys to match stored order, if specified in the node['nodes'] array.
        @craftjs.select { |_key, value| value['parent'] == node_key }
          .keys
          .sort_by { |key| node['nodes']&.index(key) || Float::INFINITY }
      end
    end
  end
end
