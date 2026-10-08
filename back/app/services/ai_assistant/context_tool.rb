# frozen_string_literal: true

module AIAssistant
  # One MCP tool that an assistant context lets the model use.
  #
  # +bound+ arguments pin the tool to the context's record (e.g. the phase): they are hidden
  # from the model and added when the tool runs, so the model can't target another record.
  # +guards+ are evaluated when a change is proposed, and their values are passed along when
  # it runs (e.g. a stale-data timestamp).
  class ContextTool
    Result = Data.define(:text, :error)

    attr_reader :tool_class, :bound, :guards

    def initialize(tool_class:, bound: {}, guards: {})
      @tool_class = tool_class
      @bound = bound.stringify_keys
      @guards = guards.stringify_keys
    end

    delegate :name, :description, to: :definition

    def hidden_keys
      bound.keys + guards.keys
    end

    def read_only?
      definition.annotations&.dig(:read_only_hint) == true
    end

    def llm_schema
      schema = definition.input_schema.deep_stringify_keys
      {
        'type' => 'object',
        'properties' => schema.fetch('properties', {}).except(*hidden_keys),
        'required' => Array(schema['required']) - hidden_keys,
        'additionalProperties' => false
      }
    end

    # Pinned and guard arguments, as they are when the change is proposed.
    def snapshot
      bound.merge(guards.transform_values(&:call)).compact
    end

    # Why the tool would refuse these arguments, or nil.
    def validation_error(user, args)
      tool(user).input_schema.validate_arguments(args)
      McpServer::LocaleGuard.error_message(args)
    rescue MCP::Tool::InputSchema::ValidationError => e
      e.message
    end

    # Runs the tool as +user+, who must be allowed to do so by the tool's own authorization.
    def call(user, args)
      tool = tool(user)
      # Direct calls skip the argument validation that the MCP server does.
      tool.input_schema.validate_arguments(args)
      response = tool.call(server_context: {}, **args.to_h.transform_keys(&:to_sym))
      text = Array(response.content).filter_map { |block| block[:text] || block['text'] }.join("\n")
      Result.new(text: response.error? ? "Error: #{text}" : text, error: response.error?)
    rescue MCP::Tool::InputSchema::ValidationError => e
      Result.new(text: "Error: #{e.message}", error: true)
    rescue StandardError
      # Errors raised by the tool itself are reported to Sentry by BaseTool.
      Result.new(text: 'Error: the tool failed unexpectedly.', error: true)
    end

    private

    def definition
      @definition ||= tool_class.new
    end

    def tool(user)
      tool_class.for(current_user: user, token_scopes: [], channel: 'ai_assistant')
    end
  end
end
