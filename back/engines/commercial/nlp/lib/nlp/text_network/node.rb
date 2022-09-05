# frozen_string_literal: true

module NLP
  class TextNetwork
    class Node
      attr_reader :name, :importance_score
      attr_accessor :id

      # @param [String] id
      # @param [Numeric] importance_score
      def initialize(id, importance_score)
        @id = id
        @name = id
        @importance_score = importance_score
      end

      def as_json(_options = nil)
        { id: name, pagerank: importance_score }.with_indifferent_access
      end

      def ==(other)
        return true if equal?(other)

        id == other.id && importance_score == other.importance_score
      end
    end
  end
end
