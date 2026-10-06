# frozen_string_literal: true

module ReportBuilder
  module Craftjs
    # Validates a report's craftjs node graph and, on failure, returns a message the
    # report composer can correct itself from: what is wrong, plus the documentation
    # for exactly the widgets the errors point at.
    #
    # Wraps ContentBuilder::Craftjs::Validator with the report widget specs and root
    # type, the way McpServer::Tools::UpdateProjectLayout does for project pages.
    class LayoutValidator
      # Generous ceiling to bound a runaway generation; a rich report lands well under this.
      MAX_NODES = 300

      Result = Data.define(:valid, :message) do
        def valid? = valid
      end

      def self.validate(craftjs_json, convention_scope: nil, widget_specs: WidgetSpecs::SPECS)
        new(craftjs_json, convention_scope: convention_scope, widget_specs: widget_specs).validate
      end

      # @param convention_scope [Array<String>, nil] node ids to check widget conventions
      #   on. Pass the ids just written so pre-existing nodes cannot fail an update that
      #   did not touch them; nil checks the whole graph.
      # @param widget_specs [Hash] the rules to validate against. The composer passes
      #   WidgetSpecs.with_allowed_ids so a made-up record id is caught here rather
      #   than raising later, in the query behind the chart.
      def initialize(craftjs_json, convention_scope: nil, widget_specs: WidgetSpecs::SPECS)
        @craftjs_json = craftjs_json
        @convention_scope = convention_scope
        @widget_specs = widget_specs
      end

      def validate
        unless @craftjs_json.is_a?(Hash)
          return failure(['the layout must be a JSON object mapping node ids to nodes'], [])
        end

        if @craftjs_json.size > MAX_NODES
          return failure(["the graph has #{@craftjs_json.size} nodes, above the maximum of #{MAX_NODES}"], [])
        end

        errors = validator_errors
        return Result.new(valid: true, message: nil) if errors.none?

        failure(errors.map(&:to_s), widgets_in(errors))
      end

      private

      def validator_errors
        ContentBuilder::Craftjs::Validator.new(
          @craftjs_json,
          widget_specs: @widget_specs,
          root_type: WidgetSpecs::ROOT_TYPE,
          convention_scope: @convention_scope
        ).errors
      end

      # Docs for just the widgets the errors point at, to keep retry messages small.
      def widgets_in(errors)
        errors.filter_map do |error|
          node = error.node_id && @craftjs_json[error.node_id]
          next unless node.is_a?(Hash)

          type = node['type']
          type.is_a?(Hash) ? type['resolvedName'] : nil
        end
      end

      def failure(problems, widgets)
        Result.new(
          valid: false,
          message: "Layout NOT saved. Fix these problems and retry:\n" \
                   "#{problems.map { |problem| "- #{problem}" }.join("\n")}\n\n" \
                   "#{LayoutWidgets.reference_for(widgets)}"
        )
      end
    end
  end
end
