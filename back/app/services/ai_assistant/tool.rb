# frozen_string_literal: true

module AIAssistant
  # One MCP tool that an assistant surface lets the model use.
  #
  # +pinned+ arguments are set by the surface, not the model (e.g. the phase): they are
  # hidden from the model and added when the tool runs, so the model can't target another
  # record.
  # +allow+ restricts the records the model picks itself (e.g. to the project's phases).
  # +omit+ hides properties the model may not set.
  class Tool
    Result = Data.define(:text, :error)
    OUTSIDE_SUBJECT_TEXT = 'Not allowed: this record is outside what you can change here.'

    attr_reader :tool_class, :pinned

    def initialize(tool_class, pinned: {}, allow: nil, omit: [])
      @tool_class = tool_class
      @pinned = pinned.stringify_keys
      @allow = allow
      @omit = omit.map(&:to_s)
    end

    delegate :name, :description, to: :definition

    def hidden_keys
      pinned.keys + @omit
    end

    # Read-only tools run without approval, so a tool without annotations counts as a write tool.
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

    # Why the tool would refuse these arguments, or nil.
    def validation_error(user, args)
      return OUTSIDE_SUBJECT_TEXT unless allowed?(args)

      tool(user).input_schema.validate_arguments(args)
      McpServer::LocaleGuard.error_message(args)
    rescue MCP::Tool::InputSchema::ValidationError => e
      e.message
    end

    # Runs the tool as +user+, whose access to the subject is checked by the assistant's policies.
    def call(user, args)
      return Result.new(text: "Error: #{OUTSIDE_SUBJECT_TEXT}", error: true) unless allowed?(args)

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

    def allowed?(args)
      @allow.nil? || @allow.call(args) == true
    end

    def definition
      @definition ||= tool_class.new
    end

    def tool(user)
      tool_class.for(current_user: user, token_scopes: [], channel: 'ai_assistant')
    end
  end
end
