# frozen_string_literal: true

module NLP
  class TextNetwork
    class Community
      attr_reader :children, :importance_score
      attr_accessor :id

      # @param [String] id
      # @param [Array<NLP::TextNetwork::Node>] children
      # @param [Numeric] importance_score
      def initialize(id, children, importance_score)
        @id = id
        @children = children
        @importance_score = importance_score
      end

      def children_ids
        children.map(&:id)
      end

      # Keeps only the top n most important child nodes.
      # @param [Integer] n maximum number of child nodes
      # @return [Array<NLP::TextNetwork::Node>] child nodes that are removed
      def shrink(n)
        keep = children.sort_by(&:importance_score).reverse.take(n).map(&:id)

        @children, removed = children.partition { |node| keep.include?(node.id) }
        removed
      end

      def as_json(_options = nil)
        {
          partitions_id: id,
          influent_nodes: children_ids,
          relative_size: importance_score
        }.with_indifferent_access
      end

      def ==(other)
        id == other.id &&
          importance_score == other.importance_score &&
          children == other.children
      end
    end
  end
end
