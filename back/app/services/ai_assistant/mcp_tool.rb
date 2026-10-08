# frozen_string_literal: true

module AIAssistant
  # Exposes an MCP tool to the model. The tool runs right away, as the conversation's user.
  class McpTool < RubyLLM::Tool
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
      else
        run_read_tool(tool_call, arguments)
      end
    end

    private

    def run_read_tool(tool_call, arguments)
      result = @context_tool.call(@runner.user, arguments.merge(@context_tool.bound))
      tool_call.update!(status: result.error ? 'failed' : 'auto_executed', arguments:, result: result.text)
      result.text
    end
  end
end
