module ContentBuilder
  module Craftjs
    # This service is not used by MultilocsInNaturalOrder.
    # It's just an earlier version of my exploration of DFS.
    class NodesOrderedByDepthFirst
      def initialize(craftjs)
        @craftjs = craftjs
        @ordered_nodes = []
        @ordered_multilocs = []
      end

      def nodes_ordered_by_depth_first
        depth_first_search_recursive('ROOT')
        @ordered_nodes
      end

      private

      def depth_first_search_recursive(node_key)
        node = @craftjs[node_key]
        return if node.blank?

        @ordered_nodes << node

        children = @craftjs.select { |_key, value| value['parent'] == node_key }.keys
        children.each { |child_key| depth_first_search_recursive(child_key) } if children.present?
      end
    end
  end
end
