# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::StatusMapper do
  let(:llm) { instance_double(DecidimImporter::StatusMapper::DEFAULT_MODEL) }

  def states(*keys)
    keys.map { |key| { 'key' => key, 'label_multiloc' => { 'fr' => key }, 'tokens' => [key.split('|').first], 'count' => 5 } }
  end

  describe '#map' do
    it 'turns a well-formed LLM answer into custom statuses and per-state decisions' do
      response = {
        'custom_statuses' => [
          { 'id' => 'feasible', 'title_multiloc' => { 'fr' => 'Idée faisable' }, 'color' => '#123456',
            'description_multiloc' => { 'fr' => 'Réalisable' } }
        ],
        'mappings' => [
          { 'key' => 'not_answered|En attente', 'target' => 'standard', 'code' => 'proposed' },
          { 'key' => 'viable|Idée faisable', 'target' => 'custom', 'custom_status_id' => 'feasible' }
        ]
      }.to_json
      allow(llm).to receive(:chat).and_return(response)

      result = described_class.new(llm: llm).map(states('not_answered|En attente', 'viable|Idée faisable'))

      expect(result.custom_statuses).to eq(
        [{ 'id' => 'feasible', 'title_multiloc' => { 'fr' => 'Idée faisable' },
           'description_multiloc' => { 'fr' => 'Réalisable' }, 'color' => '#123456' }]
      )
      expect(result.decisions['not_answered|En attente']).to eq(target: 'standard', code: 'proposed')
      expect(result.decisions['viable|Idée faisable']).to eq(target: 'custom', custom_status_id: 'feasible')
    end

    it 'accepts a schema-aware model that returns an already-parsed hash' do
      allow(llm).to receive(:chat).and_return(
        'custom_statuses' => [], 'mappings' => [{ 'key' => 'accepted|Retenue', 'target' => 'standard', 'code' => 'accepted' }]
      )

      result = described_class.new(llm: llm).map(states('accepted|Retenue'))

      expect(result.decisions['accepted|Retenue']).to eq(target: 'standard', code: 'accepted')
    end

    it 'extracts the JSON object even when the model wraps it in markdown fences and prose' do
      json = { 'custom_statuses' => [], 'mappings' => [{ 'key' => 'accepted|Retenue', 'target' => 'standard', 'code' => 'accepted' }] }.to_json
      allow(llm).to receive(:chat).and_return("Here is the mapping:\n```json\n#{json}\n```\nHope that helps!")

      result = described_class.new(llm: llm).map(states('accepted|Retenue'))

      expect(result.decisions['accepted|Retenue']).to eq(target: 'standard', code: 'accepted')
    end

    it 'coerces an unknown standard code and a dangling custom id to the default proposed status' do
      response = {
        'custom_statuses' => [],
        'mappings' => [
          { 'key' => 'a|A', 'target' => 'standard', 'code' => 'not_a_real_code' },
          { 'key' => 'b|B', 'target' => 'custom', 'custom_status_id' => 'missing' }
        ]
      }.to_json
      allow(llm).to receive(:chat).and_return(response)

      result = described_class.new(llm: llm).map(states('a|A', 'b|B'))

      expect(result.decisions.values).to all(eq(target: 'standard', code: 'proposed'))
    end

    it 'caps the custom statuses and forces decisions onto dropped customs back to standard' do
      customs = (1..8).map { |i| { 'id' => "c#{i}", 'title_multiloc' => { 'fr' => "S#{i}" }, 'color' => '#000000' } }
      mappings = (1..8).map { |i| { 'key' => "k#{i}|K#{i}", 'target' => 'custom', 'custom_status_id' => "c#{i}" } }
      allow(llm).to receive(:chat).and_return({ 'custom_statuses' => customs, 'mappings' => mappings }.to_json)

      result = described_class.new(llm: llm).map(states(*(1..8).map { |i| "k#{i}|K#{i}" }))

      expect(result.custom_statuses.size).to eq(described_class::MAX_CUSTOM_STATUSES)
      # The two customs beyond the cap fall back to the standard proposed status.
      dropped = result.decisions.values.count { |d| d == { target: 'standard', code: 'proposed' } }
      expect(dropped).to eq(2)
    end

    it 'drops a custom status missing an id or title' do
      response = {
        'custom_statuses' => [{ 'id' => '', 'title_multiloc' => { 'fr' => 'x' } }, { 'id' => 'ok', 'title_multiloc' => {} }],
        'mappings' => []
      }.to_json
      allow(llm).to receive(:chat).and_return(response)

      result = described_class.new(llm: llm).map(states('a|A'))

      expect(result.custom_statuses).to be_empty
    end

    it 'falls back to the token heuristic (all standard, no custom) when the model raises' do
      allow(llm).to receive(:chat).and_raise(StandardError, 'bedrock down')
      allow(ErrorReporter).to receive(:report)

      result = described_class.new(llm: llm).map(
        [{ 'key' => 'evaluating|En cours', 'label_multiloc' => {}, 'tokens' => ['evaluating'], 'count' => 3 }]
      )

      expect(result.custom_statuses).to be_empty
      expect(result.decisions['evaluating|En cours']).to eq(target: 'standard', code: 'under_consideration')
      expect(ErrorReporter).to have_received(:report)
    end

    it 'returns an empty result without calling the model when there are no states' do
      allow(llm).to receive(:chat)
      result = described_class.new(llm: llm).map([])

      expect(result.custom_statuses).to be_empty
      expect(result.decisions).to be_empty
      expect(llm).not_to have_received(:chat)
    end
  end
end
