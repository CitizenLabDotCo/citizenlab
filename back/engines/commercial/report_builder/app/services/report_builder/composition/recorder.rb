# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Writes a run's messages to the report's conversation as the composer produces
    # them, so a run that dies, or is still going, has left a record of what it did.
    #
    # The text of a message becomes a message row, each tool call a tool call row, and
    # each tool result is filled in on the call it answers. Screenshots are not stored:
    # they cost thousands of tokens to replay and show a version of a chart that has
    # since been fixed or replaced.
    #
    # Best effort. A row that fails to write is reported and the run goes on: failing
    # minutes of paid work over bookkeeping would only mean doing it all again.
    class Recorder
      # @param run [Run, nil] nothing is written without one (an eval run, say).
      def initialize(run)
        @run = run
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
        row = @run.append_message!(
          role: 'assistant',
          content: Messages.assistant_text(message),
          displayed: false,
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
        @run.append_message!(role: 'user', content: text, displayed: false) if text.present?
      end

      def token_count(usage, field)
        usage.respond_to?(field) ? usage.public_send(field).to_i : nil
      end
    end
  end
end
