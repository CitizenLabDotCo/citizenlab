# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Writes a run's messages to the report's conversation as the composer produces
    # them, so a run that dies, or is still going, has left a record of what it did.
    #
    # What the model is sent is a message's model_text, so the chat panel shows the
    # admin's question and the closing reply rather than the prompts and the dozens of
    # rounds between them. The admin's question is already a message when the run
    # starts, and the prompt written around it fills in that same message's model_text:
    # one exchange, one row.
    #
    # Each tool call becomes a tool call row, and each tool result is filled in on the
    # call it answers. Screenshots are not stored: they cost thousands of tokens to
    # replay and show a version of a chart that has since been fixed or replaced.
    #
    # Best effort. A row that fails to write is reported and the run goes on: failing
    # minutes of paid work over bookkeeping would only mean doing it all again.
    class Recorder
      # @param run [AIAssistant::Run, nil] nothing is written without one (an eval run, say).
      # @param author [User, nil] who the run is for. Every message it writes is theirs.
      # @param turn_id [String, nil] the admin's message this run answers, whose context
      #   the first prompt fills in.
      def initialize(run, author: nil, turn_id: nil)
        @run = run
        @author = author
        @turn_id = turn_id
        @tool_calls = {}
      end

      # @param message [Hash] as the composer keeps it (see Messages).
      # @param usage [#input_tokens, #output_tokens, nil] the provider's counts for the
      #   round that produced an assistant message.
      def record(message, usage: nil)
        return if @run.nil?

        if message[:role] == 'assistant'
          record_assistant(message, usage)
        else
          record_user(message)
        end
      rescue StandardError => e
        ErrorReporter.report(e, extra: { run_id: @run.id })
      end

      private

      def record_assistant(message, usage)
        row = append(
          role: 'assistant',
          model_text: Messages.assistant_text(message),
          input_tokens: token_count(usage, :input_tokens),
          output_tokens: token_count(usage, :output_tokens)
        )

        Messages.tool_calls(message).each do |call|
          @tool_calls[call[:id]] = row.tool_calls.create!(
            tool_use_id: call[:id],
            name: call[:name],
            arguments: call[:input] || {},
            status: 'pending'
          )
        end
      end

      # A user message from the composer is the results of the calls just made, a
      # prompt, or both.
      def record_user(message)
        message[:content].each do |block|
          result = block[:tool_result]
          next if result.nil?

          @tool_calls[result[:tool_use_id]]&.update!(
            status: result[:status] == 'error' ? 'failed' : 'auto_executed',
            result: result[:content].filter_map { |part| part[:text] }.join("\n")
          )
        end

        text = message[:content].filter_map { |block| block[:text] }.join("\n")
        return if text.blank?

        prompt_for_the_turn(text) || append(role: 'user', model_text: text)
      end

      # The first prompt of a turn belongs to the question it was written around. Only
      # the first: a run's review pass writes a prompt of its own.
      def prompt_for_the_turn(text)
        return nil if @turn_id.nil?

        turn = @run.conversation.messages.find_by(id: @turn_id)
        @turn_id = nil
        return nil if turn.nil?

        turn.update!(model_text: text, run: @run)
        turn
      end

      def append(**attributes)
        @run.append_message!(author: @author, **attributes)
      end

      def token_count(usage, field)
        usage.respond_to?(field) ? usage.public_send(field).to_i : nil
      end
    end
  end
end
