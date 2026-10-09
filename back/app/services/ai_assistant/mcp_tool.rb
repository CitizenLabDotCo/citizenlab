# frozen_string_literal: true

module AIAssistant
  # Exposes an MCP tool to the model. Read-only tools run right away. Write tools never run
  # here: the call is stored as a proposal and the turn stops (+halt+), until the user
  # approves or rejects it (see ToolCallDecider).
  class McpTool < RubyLLM::Tool
    PROPOSED_TEXT = 'Proposed to the user, who will approve or reject it.'
    BUDGET_TEXT = { error: 'Too many tool calls in one turn. Stop and summarise for the user.' }.to_json

    def initialize(context_tool, runner)
      super()
      @context_tool = context_tool
      @runner = runner
    end

    def name = @context_tool.name
    def description = @context_tool.description
    def params_schema = @context_tool.llm_schema

    def execute(**args)
      tool_call = @runner.current_tool_call
      arguments = args.deep_stringify_keys.except(*@context_tool.hidden_keys)

      if @runner.over_tool_budget?
        tool_call.update!(status: 'failed', arguments:, result: BUDGET_TEXT)
        halt(BUDGET_TEXT)
      elsif @context_tool.read_only?
        run_read_tool(tool_call, arguments)
      else
        propose(tool_call, arguments)
      end
    end

    private

    def run_read_tool(tool_call, arguments)
      result = @context_tool.call(@runner.user, arguments.merge(@context_tool.bound))
      tool_call.update!(status: result.error ? 'failed' : 'auto_executed', arguments:, result: result.text)
      result.text
    end

    def propose(tool_call, arguments)
      snapshot = @context_tool.snapshot
      error = @context_tool.validation_error(@runner.user, arguments.merge(snapshot))

      if error
        # Sent back to the model, so it fixes the call before the user is asked.
        text = "Error: #{error}"
        tool_call.update!(status: 'failed', arguments:, result: text)
        text
      else
        tool_call.update!(status: 'proposed', arguments:, bound_arguments: snapshot)
        halt(PROPOSED_TEXT)
      end
    end
  end
end
