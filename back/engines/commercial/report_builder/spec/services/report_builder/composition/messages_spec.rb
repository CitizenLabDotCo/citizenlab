# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::Messages do
  let(:png) { Base64.strict_encode64('not really a png') }

  def tool_use(id, name, input = {})
    { 'tool_use' => { 'tool_use_id' => id, 'name' => name, 'input' => input } }
  end

  describe '.results_message' do
    # The provider refuses anything but text inside a result marked as an error, and a
    # failed check is exactly when there is a picture.
    it 'answers every call with text, and puts the screenshots after the results' do
      message = described_class.results_message([
        [{ id: 'tu_1' }, { text: 'Too wide.', error: true, screenshot: png }],
        [{ id: 'tu_2' }, { text: '3 rows.' }]
      ])

      expect(message[:role]).to eq 'user'
      expect(message[:content].map(&:keys)).to eq [[:tool_result], [:tool_result], [:image]]
      expect(message[:content].first[:tool_result]).to eq(
        tool_use_id: 'tu_1', content: [{ text: 'Too wide.' }], status: 'error'
      )
      expect(message[:content].last[:image]).to eq(format: 'png', source: { bytes: png })
    end

    it 'is results only when nothing was photographed' do
      message = described_class.results_message([[{ id: 'tu_1' }, { text: 'Everything checked out.' }]])

      expect(message[:content].map(&:keys)).to eq [[:tool_result]]
    end
  end

  describe '.to_provider' do
    it 'decodes every image to bytes and leaves the rest alone' do
      messages = [
        { role: 'assistant', content: [tool_use('tu_1', 'check').deep_symbolize_keys] },
        described_class.results_message([[{ id: 'tu_1' }, { text: 'Too wide.', error: true, screenshot: png }]])
          .then { |m| m.merge(content: m[:content] + [{ cache_point: { type: 'default' } }]) }
      ]

      sent = described_class.to_provider(messages)

      expect(sent.last[:content][1][:image][:source][:bytes]).to eq 'not really a png'
      expect(sent.last[:content].last).to eq(cache_point: { type: 'default' })
      expect(sent.first).to eq messages.first
      # The transcript itself still holds text, so it can be stored.
      expect(messages.last[:content][1][:image][:source][:bytes]).to eq png
    end
  end

  describe '.history' do
    let(:conversation) { create(:report).chat!(locale: 'en') }

    # What the model was sent is the context; the panel's half of a message is not
    # replayed.
    def message(role, text = nil)
      conversation.messages.create!(role: role, model_text: text)
    end

    def call(message, id, name, status: 'auto_executed', result: 'ok', input: {})
      message.tool_calls.create!(tool_use_id: id, name: name, arguments: input, status: status, result: result)
    end

    def rows = conversation.messages.includes(:tool_calls).to_a

    it 'turns stored messages back into what the composer works with' do
      message('user', 'Generate the report.')
      call(message('assistant'), 'tu_1', 'get_layout', input: { 'a' => 1 }, result: 'empty')
      message('assistant', 'Done.')

      history = described_class.history(rows)

      expect(history.map { |m| m[:role] }).to eq %w[user assistant user assistant]
      expect(history[1][:content].first[:tool_use]).to eq(tool_use_id: 'tu_1', name: 'get_layout', input: { 'a' => 1 })
      expect(history[2][:content].first[:tool_result]).to eq(
        tool_use_id: 'tu_1', content: [{ text: 'empty' }], status: 'success'
      )
    end

    it 'keeps the text of a message that also called tools, before the calls' do
      message('user', 'go')
      call(message('assistant', 'Looking.'), 'tu_1', 'get_layout')

      expect(described_class.history(rows)[1][:content].map(&:keys)).to eq [[:text], [:tool_use]]
    end

    it 'answers a failed call as an error' do
      message('user', 'go')
      call(message('assistant'), 'tu_1', 'patch_layout', status: 'failed', result: 'ROOT is missing.')

      expect(described_class.history(rows).last[:content].first[:tool_result]).to include(status: 'error')
    end

    # The provider rejects a conversation that continues past an unanswered call.
    it 'answers a call its run never got to as interrupted' do
      message('user', 'go')
      call(message('assistant'), 'tu_9', 'patch_layout', status: 'pending', result: nil)

      result = described_class.history(rows).last[:content].first[:tool_result]

      expect(result).to include(tool_use_id: 'tu_9', status: 'error')
      expect(result[:content].first[:text]).to include 'interrupted'
    end

    it 'merges turns of the same role, so a run that stopped on tool results can be continued' do
      message('user', 'go')
      call(message('assistant'), 'tu_1', 'get_layout')
      message('user', 'make it shorter')

      history = described_class.history(rows)

      expect(history.map { |m| m[:role] }).to eq %w[user assistant user]
      expect(history.last[:content].map(&:keys)).to eq [[:tool_result], [:text]]
    end

    it 'starts on a user turn' do
      message('assistant', 'orphan')
      message('user', 'go')
      message('assistant', 'Done.')

      expect(described_class.history(rows).first[:content]).to eq [{ text: 'go' }]
    end

    it 'leaves out an assistant message that said nothing and called nothing' do
      message('user', 'go')
      message('assistant')

      expect(described_class.history(rows).map { |m| m[:role] }).to eq %w[user]
    end

    it 'is empty for nothing' do
      expect(described_class.history([])).to eq []
    end
  end
end
