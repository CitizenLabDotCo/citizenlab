# frozen_string_literal: true

module NLP
  class TextNetwork
    class Link
      attr_reader :from_node, :to_node, :weight

      # @param [Node] from_node
      # @param [Node] to_node
      # @param [Numeric] weight
      def initialize(from_node, to_node, weight)
        @from_node = from_node
        @to_node = to_node
        @weight = weight
      end

      def from_id
        from_node.id
      end

      def to_id
        to_node.id
      end

      def as_json(_options = nil)
        { source: from_node.id, target: to_node.id, weight: weight }.with_indifferent_access
      end

      def ==(other)
        from_node == other.from_node && to_node == other.to_node && weight == other.weight
      end
    end
  end
end
