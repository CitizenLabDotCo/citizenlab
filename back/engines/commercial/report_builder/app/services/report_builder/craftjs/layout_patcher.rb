# frozen_string_literal: true

module ReportBuilder
  module Craftjs
    # Merges a sparse patch into a report's craftjs node graph: the nodes that were
    # added or changed, plus the ids to remove.
    #
    # Patching rather than resending the whole graph is what keeps a report of any
    # size writable. A model that has to re-emit every node each time it adds one
    # runs into the output token limit as the report grows, and a reply cut off there
    # costs a whole round to recover from.
    #
    # Same shape as McpServer::Tools::UpdateProjectLayout, which is proven against
    # real models on project pages.
    class LayoutPatcher
      # An unusable patch. The message is written for the model that sent it.
      class PatchError < StandardError; end

      # @param graph [Hash] the report as it stands.
      # @param nodes [Hash] node-id to the node's full final JSON.
      # @param delete_node_ids [Array<String>] ids to remove, subtrees included.
      # @return [Hash] the merged graph. The input graph is left untouched.
      # @raise [PatchError]
      def self.patch(graph, nodes:, delete_node_ids: [])
        new(graph, nodes, delete_node_ids).patch
      end

      def initialize(graph, nodes, delete_node_ids)
        @graph = graph || {}
        @nodes = (nodes || {}).deep_stringify_keys
        @delete_node_ids = Array(delete_node_ids).map(&:to_s)
      end

      def patch
        if @nodes.empty? && @delete_node_ids.empty?
          raise PatchError, 'A patch needs either nodes to write or delete_node_ids to remove.'
        end

        reject_conflicting_deletes!
        reject_unknown_deletes!

        patched = @graph.deep_dup
        apply_deletes!(patched)
        patched.merge(@nodes)
      end

      private

      def reject_conflicting_deletes!
        overlap = @delete_node_ids & @nodes.keys
        return if overlap.empty?

        raise PatchError, "These ids are in both delete_node_ids and nodes: #{overlap.join(', ')}. " \
                          'To replace a node just send it in nodes; deleting it too would detach it.'
      end

      def reject_unknown_deletes!
        missing = @delete_node_ids - @graph.keys
        return if missing.empty?

        raise PatchError, "delete_node_ids that are not in the report: #{missing.join(', ')}"
      end

      def apply_deletes!(patched)
        return if @delete_node_ids.empty?

        state = ContentBuilder::Craftjs::State.new(patched)
        @delete_node_ids.each do |id|
          # Already gone with an earlier id's subtree.
          next unless patched.key?(id)

          state.delete_node(id)
        end
      rescue KeyError => e
        raise PatchError, "The report is inconsistent around a deleted node (#{e.message}). " \
                          'Send corrected nodes to fix it.'
      end
    end
  end
end
