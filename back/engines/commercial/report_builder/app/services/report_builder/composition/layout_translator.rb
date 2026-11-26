# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Fills in the platform's other locales for every multiloc in a composed layout.
    #
    # Craftjs props are free-form, so the multilocs are found by shape rather than by
    # widget: a hash whose keys are all platform locales and whose values are all
    # strings is text a reader sees, wherever in the graph it sits. That covers the
    # text widgets, the chart settings an admin can edit afterwards, and whatever a
    # widget added later puts beside them.
    #
    # The graph is filled in place: it is the one the run has been building.
    class LayoutTranslator
      SUPPORTED_LOCALES = CL2_SUPPORTED_LOCALES.map(&:to_s).freeze

      def initialize(locale:, translator: nil)
        @locale = locale
        @translator = translator || Translator.new(locale: locale)
      end

      # @param graph [Hash] a craftjs graph as the run composed it.
      # @return [Hash] the same graph, with every multiloc carrying every locale.
      def call(graph)
        written = multilocs(graph).select { |multiloc| multiloc[@locale].present? }
        return graph if written.empty?

        # Keyed by position: the ids only have to survive the round trip, and a
        # craftjs prop name is not unique across the graph.
        ids = written.each_index.map { |index| "t#{index}" }
        filled = @translator.call(ids.zip(written.pluck(@locale)).to_h)
        written.each_with_index { |multiloc, index| multiloc.merge!(filled[ids[index]] || {}) }

        graph
      end

      private

      def multilocs(node, found = [])
        case node
        when Hash
          multiloc?(node) ? found << node : node.each_value { |value| multilocs(value, found) }
        when Array
          node.each { |value| multilocs(value, found) }
        end
        found
      end

      def multiloc?(hash)
        hash.present? &&
          hash.keys.all? { |key| SUPPORTED_LOCALES.include?(key) } &&
          hash.values.all?(String)
      end
    end
  end
end
