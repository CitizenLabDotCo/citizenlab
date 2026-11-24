# frozen_string_literal: true

module ReportBuilder
  module Craftjs
    # One node and everything inside it, as a layout of its own.
    #
    # The check tool renders a layout, and "the Results section" is a layout too once
    # the node is re-hung under a fresh ROOT. The original graph is left alone.
    module Subgraph
      module_function

      # @param graph [Hash] a craftjs_json graph.
      # @param node_id [String] the node to cut out. 'ROOT' gives the whole graph back.
      # @return [Hash, nil] a graph whose ROOT holds just that node, or nil when there is
      #   no such node.
      def extract(graph, node_id)
        return graph if node_id == 'ROOT'
        return nil unless graph.is_a?(Hash) && graph[node_id].is_a?(Hash)

        ids = ContentBuilder::Craftjs::Query.subtree_ids(graph, node_id)
        nodes = graph.slice(*ids).transform_values(&:deep_dup)
        nodes[node_id]['parent'] = 'ROOT'
        nodes.merge('ROOT' => root_for(graph['ROOT'], node_id))
      end

      # The real ROOT's props carry the frame the front end mounts into, so they are
      # kept; its children are replaced by the one node.
      def root_for(root, node_id)
        base = root.is_a?(Hash) ? root.deep_dup : {}
        base.merge(
          'type' => 'div',
          'isCanvas' => true,
          'props' => base['props'] || {},
          'custom' => {},
          'hidden' => false,
          'nodes' => [node_id],
          'linkedNodes' => {},
          'displayName' => 'div'
        )
      end
    end
  end
end
