# frozen_string_literal: true

module AIAssistant
  # One turn of a conversation: replays the stored messages to the model, lets it call tools,
  # and stores what it does. The turn ends with a reply, or with proposals that wait for the
  # user's decision.
  class Turn
    # Stops RubyLLM's loop from a callback, which has no other way to end it.
    class ToolBudgetExceededError < StandardError; end

    MAX_TOOL_CALLS = 10
    MAX_OUTPUT_TOKENS = 16_000
    PROPOSED_TEXT = 'Proposed to the user, who will approve or reject it.'
    BUDGET_TEXT = { error: 'Too many tool calls in one turn. Stop and summarise for the user.' }.to_json
    ATTACHMENTS_ONLY_TEXT = 'See the attached document(s).'
    # Bedrock refuses two user turns in a row, which happens when a turn failed or its
    # proposals expired before the user wrote again.
    NO_REPLY_TEXT = '(No reply.)'

    attr_reader :conversation

    def initialize(conversation)
      @conversation = conversation
      @user = conversation.user
      @surface = Surface.for(conversation)
      @tool_call_count = 0
      @tool_calls_by_use_id = {}
    end

    def run
      unless @surface.available?
        conversation.fail_turn!('surface_unavailable')
        return
      end

      unless ended?
        chat = build_chat
        replay(chat)
        chat.complete
      end
      finish
    rescue ToolBudgetExceededError
      # A failed turn's proposals can't be decided on anymore.
      conversation.expire_proposals!
      conversation.fail_turn!('tool_budget_exceeded')
    end

    # Read-only tools run right away, as the conversation's user. Write tools never run here:
    # the call is stored as a proposal and the turn stops, until the user approves or rejects
    # it (see ToolCallDecider).
    def handle_tool_call(tool, args)
      arguments = args.except(*tool.pinned.keys)

      if tool.read_only?
        run_read_tool(tool, arguments)
      else
        propose(tool, arguments)
      end
    end

    private

    # The turn already ended, with a reply or with proposals, but the worker stopped before
    # saving the status.
    def ended?
      return true if conversation.tool_calls.proposed.exists?

      last_message = conversation.messages.last
      last_message.assistant? && last_message.tool_calls.none?
    end

    def build_chat
      llm = LLMSelector.new.llm_class_for_use_case('ai_assistant').new

      llm.chat_context
        .chat(model: llm.model, **llm.chat_options)
        .with_instructions(@surface.system_prompt(locale: conversation.locale))
        .with_tools(*@surface.tools.map { |tool| LLMTool.new(tool, self) })
        .with_params(inferenceConfig: { maxTokens: MAX_OUTPUT_TOKENS })
        .after_message { |message| persist(message) }
        .before_tool_call { |tool_call| count_tool_call!(tool_call) }
    end

    def replay(chat)
      user_turn_open = false

      conversation.messages.includes(:tool_calls).each do |message|
        if message.user?
          chat.add_message(role: :assistant, content: NO_REPLY_TEXT) if user_turn_open
          chat.add_message(role: :user, content: user_content(message))
          user_turn_open = true
        else
          tool_calls = message.tool_calls.to_a
          next if message.content.blank? && tool_calls.empty?

          chat.add_message(role: :assistant, content: message.content, tool_calls: llm_tool_calls(tool_calls))
          tool_calls.each do |tool_call|
            chat.add_message(role: :tool, content: tool_call.result_for_llm, tool_call_id: tool_call.tool_use_id)
          end
          # Tool results are sent to the model as a user turn.
          user_turn_open = tool_calls.any?
        end
      end
    end

    def user_content(message)
      content = RubyLLM::Content.new(message.content.presence || ATTACHMENTS_ONLY_TEXT)
      # The consent to share a file with AI can be withdrawn after it was attached.
      message.files.where(ai_processing_allowed: true).each do |file|
        content.add_attachment(StringIO.new(file.content.read), filename: file.name)
      end
      content
    end

    def llm_tool_calls(tool_calls)
      return nil if tool_calls.empty?

      tool_calls.to_h do |tool_call|
        [
          tool_call.tool_use_id,
          RubyLLM::ToolCall.new(id: tool_call.tool_use_id, name: tool_call.name, arguments: tool_call.arguments)
        ]
      end
    end

    def persist(message)
      case message.role
      when :assistant then persist_assistant_message(message)
      when :tool then persist_tool_result(message)
      end
    end

    def persist_assistant_message(message)
      conversation.transaction do
        record = conversation.messages.create!(
          role: 'assistant',
          content: text_of(message.content),
          input_tokens: message.input_tokens,
          output_tokens: message.output_tokens
        )

        (message.tool_calls || {}).each_value do |tool_call|
          @tool_calls_by_use_id[tool_call.id] = record.tool_calls.create!(
            tool_use_id: tool_call.id,
            name: tool_call.name,
            arguments: tool_call.arguments || {},
            status: 'pending'
          )
        end
      end
    end

    # Counts every call the model asks for, also to tools that don't exist, so the limit covers them all.
    def count_tool_call!(tool_call)
      @tool_call_count += 1
      @current_tool_call = @tool_calls_by_use_id.fetch(tool_call.id)
      return if @tool_call_count <= MAX_TOOL_CALLS

      @current_tool_call.update!(status: 'failed', result: BUDGET_TEXT)
      raise ToolBudgetExceededError
    end

    def run_read_tool(tool, arguments)
      result = tool.call(@user, arguments.merge(tool.pinned))
      @current_tool_call.update!(status: result.error ? 'failed' : 'auto_executed', arguments:, result: result.text)
      result.text
    end

    def propose(tool, arguments)
      pinned = tool.pinned.compact
      error = tool.validation_error(@user, arguments.merge(pinned))

      if error
        # Sent back to the model, so it fixes the call before the user is asked.
        text = "Error: #{error}"
        @current_tool_call.update!(status: 'failed', arguments:, result: text)
        text
      else
        @current_tool_call.update!(status: 'proposed', arguments:, pinned_arguments: pinned)
        RubyLLM::Tool::Halt.new(PROPOSED_TEXT)
      end
    end

    # The tools store their own results. A call still pending here never reached a tool,
    # e.g. because the model asked for a tool that doesn't exist.
    def persist_tool_result(message)
      tool_call = @tool_calls_by_use_id[message.tool_call_id]
      return unless tool_call&.pending?

      tool_call.update!(status: 'failed', result: text_of(message.content))
    end

    def finish
      if conversation.tool_calls.proposed.exists?
        conversation.update!(status: 'awaiting_approval', last_error_code: nil)
      else
        conversation.update!(status: 'idle', last_error_code: nil)
      end
    end

    def text_of(content)
      content.is_a?(RubyLLM::Content) ? content.text : content&.to_s.presence
    end

    # What RubyLLM sees of a Tool. The turn decides what a call does.
    class LLMTool < RubyLLM::Tool
      def initialize(tool, turn)
        super()
        @tool = tool
        @turn = turn
      end

      def name = @tool.name
      def description = @tool.description
      def params_schema = @tool.llm_schema

      def execute(**args)
        @turn.handle_tool_call(@tool, args.deep_stringify_keys)
      end
    end
  end
end
