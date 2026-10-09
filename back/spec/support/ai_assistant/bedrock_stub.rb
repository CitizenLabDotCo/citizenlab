# frozen_string_literal: true

# Stubs the Bedrock Converse API at the HTTP level, so specs run the real RubyLLM code
# (request rendering, tool loop, halting).
#
# @example
#   stub_bedrock(
#     bedrock_tool_use({ id: 'call_1', name: 'get_form_fields', input: {} }),
#     bedrock_text('Done.')
#   )
#   ...
#   bedrock_requests.last['messages'] # => the messages sent in the last request
module BedrockStubHelper
  def stub_bedrock(*replies)
    allow(ENV).to receive(:fetch).and_call_original
    {
      'AWS_ACCESS_KEY_ID' => 'test-access-key',
      'AWS_SECRET_ACCESS_KEY' => 'test-secret-key',
      'AWS_TOXICITY_DETECTION_REGION' => 'eu-central-1'
    }.each { |name, value| allow(ENV).to receive(:fetch).with(name, nil).and_return(value) }

    queued_replies = replies.dup
    stub_request(:post, %r{bedrock-runtime\..+/converse\z}).to_return do |request|
      bedrock_requests << JSON.parse(request.body)
      raise 'No Bedrock reply left for this request' if queued_replies.empty?

      { status: 200, headers: { 'Content-Type' => 'application/json' }, body: queued_replies.shift.to_json }
    end
  end

  def bedrock_requests
    @bedrock_requests ||= []
  end

  def bedrock_text(text)
    bedrock_reply([{ text: text }], stop_reason: 'end_turn')
  end

  # @param tool_uses [Array<Hash>] each { id:, name:, input: }
  def bedrock_tool_use(*tool_uses, text: nil)
    blocks = tool_uses.map do |tool_use|
      { toolUse: { toolUseId: tool_use[:id], name: tool_use[:name], input: tool_use[:input] || {} } }
    end
    bedrock_reply([*([{ text: text }] if text), *blocks], stop_reason: 'tool_use')
  end

  private

  def bedrock_reply(content, stop_reason:)
    {
      output: { message: { role: 'assistant', content: content } },
      stopReason: stop_reason,
      usage: { inputTokens: 100, outputTokens: 20, totalTokens: 120 }
    }
  end
end

RSpec.configure do |config|
  config.include BedrockStubHelper
end
