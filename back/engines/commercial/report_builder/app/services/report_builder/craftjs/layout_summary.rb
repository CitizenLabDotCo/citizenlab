# frozen_string_literal: true

module ReportBuilder
  module Craftjs
    # Renders a report's node graph as an indented outline.
    #
    # This is what the model reads back after every patch, and it is deliberately not
    # the graph: node ids, widget names and a snippet of the text are enough to decide
    # what to change next, and cost a fraction of the tokens.
    module LayoutSummary
      module_function

      # @param craftjs_json [Hash] the report as it stands.
      # @return [String] one line per node, in reading order.
      def text(craftjs_json)
        McpServer::Serializers::LayoutOutline.new(craftjs_json).entries.map do |entry|
          indent = '  ' * entry[:depth].to_i
          label = [entry[:id], entry[:widget]].compact.join(' ')
          snippet = entry[:text].presence

          "#{indent}#{label}#{snippet ? " — #{snippet}" : ''}"
        end.join("\n")
      end
    end
  end
end
