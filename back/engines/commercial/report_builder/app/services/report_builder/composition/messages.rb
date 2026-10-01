# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Converting between the Bedrock Converse structs and the plain hashes the
    # composer keeps its transcript in.
    #
    # Plain hashes, not the SDK's structs, because the transcript is stored and read
    # back long after the run: a record of what was said should not need the provider's
    # object model to make sense of it.
    module Messages
      module_function

      # @param message [Struct] an assistant message from the Converse response.
      def serialize(message)
        content = message.content.filter_map do |block|
          if block.respond_to?(:text) && block.text
            { text: block.text }
          elsif block.respond_to?(:tool_use) && block.tool_use
            {
              tool_use: {
                tool_use_id: block.tool_use.tool_use_id,
                name: block.tool_use.name,
                # Tool input is payload, not request parameters: it keeps its string keys.
                input: block.tool_use.input.to_h
              }
            }
          end
        end

        { role: 'assistant', content: content }
      end

      # @return [Array<Hash>] {id:, name:, input:} for every tool the message called.
      def tool_calls(assistant_message)
        assistant_message[:content].filter_map do |block|
          tool_use = block[:tool_use]
          next unless tool_use

          { id: tool_use[:tool_use_id], name: tool_use[:name], input: tool_use[:input] }
        end
      end

      def assistant_text(assistant_message)
        texts = assistant_message[:content].filter_map { |block| block[:text] }
        texts.empty? ? nil : texts.join("\n")
      end

      # Every tool call must be answered, or the next request is rejected.
      def tool_result(tool_use_id, outcome)
        {
          tool_result: {
            tool_use_id: tool_use_id,
            content: [{ text: outcome[:text] }],
            status: outcome[:error] ? 'error' : 'success'
          }
        }
      end
    end
  end
end
