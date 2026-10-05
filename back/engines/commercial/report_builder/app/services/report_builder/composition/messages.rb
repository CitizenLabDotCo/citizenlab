# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Converting between the Bedrock Converse structs and the plain hashes the
    # composer keeps its transcript in.
    #
    # Plain hashes, not the SDK's structs, because the transcript is stored and read
    # back long after the run: a record of what was said should not need the provider's
    # object model to make sense of it. Images are kept as base64 text for the same
    # reason, and turned into bytes only on the way to the provider.
    module Messages
      module_function

      SCREENSHOT_OMITTED = '[screenshot omitted from history]'

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

      # Stored messages, made fit to continue from.
      #
      # Read back from the database the keys are strings; the composer works in symbols.
      # Screenshots are dropped: they cost thousands of tokens each and were about a
      # version of the chart that has since been fixed or replaced. A run that died
      # mid-round leaves an assistant message whose tool calls were never answered, and
      # the provider rejects a conversation that continues past one, so that tail goes.
      # Two user messages in a row (a run stopped on tool results, then the next turn)
      # are merged, because turns must alternate.
      #
      # @param messages [Array<Hash>] as stored, string or symbol keys.
      # @return [Array<Hash>] symbol keys, images omitted, ending on a complete round.
      def history(messages)
        shaped = messages.map { |message| strip_images(symbolize(message)) }
        shaped.pop while shaped.any? && unanswered?(shaped.last)
        shaped.shift while shaped.any? && shaped.first[:role] != 'user'

        shaped.each_with_object([]) do |message, merged|
          if merged.any? && merged.last[:role] == message[:role]
            merged[-1] = merged.last.merge(content: merged.last[:content] + message[:content])
          else
            merged << message
          end
        end
      end

      def symbolize(message)
        role = message[:role] || message['role']
        content = (message[:content] || message['content'] || []).map { |block| symbolize_block(block) }
        { role: role, content: content }
      end

      # Keys are symbolized one level at a time by hand: a tool's input is payload and
      # keeps its string keys, which deep_symbolize_keys would not respect.
      def symbolize_block(block)
        block = block.transform_keys(&:to_sym)
        if block[:tool_use]
          use = block[:tool_use].transform_keys(&:to_sym)
          block[:tool_use] = use.merge(input: (use[:input] || {}).to_h.deep_stringify_keys)
        end
        if block[:tool_result]
          result = block[:tool_result].transform_keys(&:to_sym)
          result[:content] = (result[:content] || []).map(&:deep_symbolize_keys)
          block[:tool_result] = result
        end
        block
      end

      def strip_images(message)
        content = message[:content].map do |block|
          block[:image] ? { text: SCREENSHOT_OMITTED } : block
        end
        message.merge(content: content)
      end

      def unanswered?(message)
        message[:role] == 'assistant' && message[:content].any? { |block| block[:tool_use] }
      end
    end
  end
end
