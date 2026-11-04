# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Converting between the Bedrock Converse structs, the plain hashes the composer
    # keeps its transcript in, and the conversation rows a report's runs are stored as.
    #
    # Plain hashes, not the SDK's structs, so that a transcript can be written down and
    # read back without the provider's object model. Images are kept as base64 text and
    # turned into bytes only on the way to the provider.
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

      # The user turn that answers a round of tool calls: every result, then every
      # screenshot. A picture cannot go inside the result it belongs to — the provider
      # refuses anything but text in a result marked as an error, and a failed check is
      # exactly when there is a picture — so it follows the results as a block of its own.
      #
      # @param outcomes [Array<[Hash, Hash]>] [call, outcome] pairs, the call carrying :id.
      def results_message(outcomes)
        results = outcomes.map { |call, outcome| tool_result(call[:id], outcome) }
        pictures = outcomes.filter_map do |_call, outcome|
          next if outcome[:screenshot].blank?

          { image: { format: 'png', source: { bytes: outcome[:screenshot] } } }
        end

        { role: 'user', content: results + pictures }
      end

      # The transcript as the provider wants it: the same messages, with every image's
      # base64 text decoded to bytes.
      def to_provider(messages)
        messages.map do |message|
          message.merge(content: message[:content].map { |block| provider_block(block) })
        end
      end

      def provider_block(block)
        return block unless block[:image]

        block.merge(image: block[:image].merge(source: { bytes: Base64.strict_decode64(block[:image][:source][:bytes]) }))
      end

      # A report's stored conversation, made fit to continue from.
      #
      # Each assistant message is followed by the results of its tool calls, read back
      # from the calls themselves. A call that never got a result — its run was cut off
      # mid-round — is answered as interrupted, because the provider rejects a
      # conversation that continues past an unanswered call. Two user messages in a row
      # (a run stopped on tool results, then the next turn) are merged, because turns
      # must alternate.
      #
      # @param rows [Array<AIAssistant::Message>] replayed messages, oldest first, with
      #   their tool calls.
      # @return [Array<Hash>] starting on a user turn, roles alternating.
      def history(rows)
        shaped = from_rows(rows)
        shaped.shift while shaped.any? && shaped.first[:role] != 'user'

        shaped.each_with_object([]) do |message, merged|
          if merged.any? && merged.last[:role] == message[:role]
            merged[-1] = merged.last.merge(content: merged.last[:content] + message[:content])
          else
            merged << message
          end
        end
      end

      # How much of these messages reaches a prompt that replays them, in characters.
      def replayed_size(rows)
        from_rows(rows).sum { |message| message.to_json.size }
      end

      def from_rows(rows)
        rows.flat_map do |row|
          next [{ role: 'user', content: [{ text: row.content }] }] if row.user?

          calls = row.tool_calls.to_a
          content = []
          content << { text: row.content } if row.content.present?
          content += calls.map do |call|
            { tool_use: { tool_use_id: call.tool_use_id, name: call.name, input: call.arguments } }
          end
          next [] if content.empty?

          results = calls.map do |call|
            tool_result(call.tool_use_id, text: call.result_for_llm, error: !call.auto_executed?)
          end
          [{ role: 'assistant', content: content }] + (results.empty? ? [] : [{ role: 'user', content: results }])
        end
      end
    end
  end
end
