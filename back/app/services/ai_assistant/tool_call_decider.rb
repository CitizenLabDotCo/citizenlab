# frozen_string_literal: true

module AIAssistant
  # Applies the user's decision on a proposed tool call. An approved call runs as the
  # deciding user, through the tool's own authorization. Once every proposal of the turn is
  # decided, the conversation continues so the model can react to the outcome.
  #
  # Returns :ok, :busy (the conversation isn't waiting for a decision), :expired, or
  # :not_proposed (already decided).
  class ToolCallDecider
    def initialize(tool_call, user)
      @tool_call = tool_call
      @user = user
      @conversation = tool_call.conversation
    end

    def approve!
      decide(approved: true)
    end

    def reject!(reason = nil)
      decide(approved: false, reason: reason.presence)
    end

    private

    def decide(approved:, reason: nil)
      return :busy unless @conversation.awaiting_approval?

      if @tool_call.expired?
        @conversation.with_lock { @conversation.expire_proposals! }
        return :expired
      end

      return :not_proposed unless claim(approved:, reason:)

      # Runs outside any transaction: the tool opens its own, which a surrounding one would
      # not roll back correctly.
      outcome = approved ? run_tool : { result: { denied: true, reason: }.compact.to_json }

      @conversation.with_lock do
        @tool_call.update!(outcome)
        continue_conversation if @conversation.tool_calls.where(status: ToolCall::UNDECIDED_STATUSES).none?
      end

      log_activity(approved)
      :ok
    end

    # Marks the call as decided, unless someone decided on it first.
    def claim(approved:, reason:)
      claimed = ToolCall
        .where(id: @tool_call.id, status: 'proposed')
        .update_all(
          status: approved ? 'approved' : 'rejected',
          decided_by_id: @user.id,
          decided_at: Time.current,
          reason:,
          updated_at: Time.current
        )
      @tool_call.reload
      claimed.positive?
    end

    def run_tool
      tool = context.tool(@tool_call.name)
      return { status: 'failed', result: { error: 'This tool is no longer available.' }.to_json } unless tool

      result = tool.call(@user, @tool_call.arguments.merge(@tool_call.bound_arguments))
      { status: result.error ? 'failed' : 'executed', result: result.text }
    end

    def continue_conversation
      @conversation.update!(status: 'running')
      TurnJob.perform_later(@conversation)
    end

    def log_activity(approved)
      LogActivityJob.perform_later(
        @tool_call,
        approved ? 'approved' : 'rejected',
        @user,
        @tool_call.decided_at.to_i,
        payload: { name: @tool_call.name, conversation_id: @conversation.id, status: @tool_call.status, reason: @tool_call.reason }.compact,
        project_id: context.project_id,
        channel: 'ai_assistant'
      )
    end

    def context
      @context ||= Context.for(@conversation)
    end
  end
end
