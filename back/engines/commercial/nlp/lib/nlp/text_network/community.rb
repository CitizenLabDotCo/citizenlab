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
