# frozen_string_literal: true

require 'rails_helper'

describe ReportBuilder::Composition::Messages do
  let(:png) { Base64.strict_encode64('not really a png') }

  def tool_use(id, name, input = {})
    { 'tool_use' => { 'tool_use_id' => id, 'name' => name, 'input' => input } }
  end

  def tool_result(id, text)
    { 'tool_result' => { 'tool_use_id' => id, 'content' => [{ 'text' => text }], 'status' => 'success' } }
  end

  def image(bytes)
    { 'image' => { 'format' => 'png', 'source' => { 'bytes' => bytes } } }
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
    it 'turns stored messages back into what the composer works with' do
      stored = [
        { 'role' => 'user', 'content' => [{ 'text' => 'Generate the report.' }] },
        { 'role' => 'assistant', 'content' => [tool_use('tu_1', 'get_layout', { 'a' => 1 })] },
        { 'role' => 'user', 'content' => [tool_result('tu_1', 'empty')] },
        { 'role' => 'assistant', 'content' => [{ 'text' => 'Done.' }] }
      ]

      history = described_class.history(stored)

      expect(history.map { |m| m[:role] }).to eq %w[user assistant user assistant]
      expect(history[1][:content].first[:tool_use]).to include(name: 'get_layout', input: { 'a' => 1 })
      expect(history[2][:content].first[:tool_result]).to include(tool_use_id: 'tu_1', status: 'success')
    end

    it 'leaves screenshots out: they are about a version that has since changed' do
      stored = [
        { 'role' => 'user', 'content' => [{ 'text' => 'go' }] },
        { 'role' => 'assistant', 'content' => [tool_use('tu_1', 'check')] },
        { 'role' => 'user', 'content' => [tool_result('tu_1', 'Too wide.'), image(png)] },
        { 'role' => 'assistant', 'content' => [{ 'text' => 'Fixed.' }] }
      ]

      content = described_class.history(stored)[2][:content]

      expect(content.first[:tool_result][:content]).to eq [{ text: 'Too wide.' }]
      expect(content.last).to eq(text: described_class::SCREENSHOT_OMITTED)
    end

    it 'drops a tool call that was never answered, which the provider would reject' do
      stored = [
        { 'role' => 'user', 'content' => [{ 'text' => 'go' }] },
        { 'role' => 'assistant', 'content' => [{ 'text' => 'Looking.' }] },
        { 'role' => 'user', 'content' => [{ 'text' => 'ok' }] },
        { 'role' => 'assistant', 'content' => [tool_use('tu_9', 'patch_layout')] }
      ]

      history = described_class.history(stored)

      expect(history.size).to eq 3
      expect(history.last[:content]).to eq [{ text: 'ok' }]
    end

    it 'merges turns of the same role, so a run that stopped on tool results can be continued' do
      stored = [
        { 'role' => 'user', 'content' => [{ 'text' => 'go' }] },
        { 'role' => 'assistant', 'content' => [tool_use('tu_1', 'get_layout')] },
        { 'role' => 'user', 'content' => [tool_result('tu_1', 'empty')] },
        { 'role' => 'user', 'content' => [{ 'text' => 'make it shorter' }] }
      ]

      history = described_class.history(stored)

      expect(history.map { |m| m[:role] }).to eq %w[user assistant user]
      expect(history.last[:content].map(&:keys)).to eq [[:tool_result], [:text]]
    end

    it 'starts on a user turn' do
      stored = [
        { 'role' => 'assistant', 'content' => [{ 'text' => 'orphan' }] },
        { 'role' => 'user', 'content' => [{ 'text' => 'go' }] },
        { 'role' => 'assistant', 'content' => [{ 'text' => 'Done.' }] }
      ]

      expect(described_class.history(stored).first[:content]).to eq [{ text: 'go' }]
    end

    it 'is empty for nothing' do
      expect(described_class.history([])).to eq []
    end
  end
end
