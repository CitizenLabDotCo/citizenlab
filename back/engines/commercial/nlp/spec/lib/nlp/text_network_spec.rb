# frozen_string_literal: true

require 'rails_helper'
require 'nlp/text_network'

describe NLP::TextNetwork do
  self.file_fixture_path = NLP::Engine.root.join('spec', 'fixtures', 'files')

  let(:json_network) { file_fixture('text_network.json').read }

  describe '#from_json' do
    it 'parses a json network correctly', :aggregate_failures do
      network = described_class.from_json(json_network)

      expect(network.nodes.length).to eq(12)
      expect(network.links.length).to eq(25)
      expect(network.communities.length).to eq(3)
      expect(network).to be_directed
    end
  end

  describe '#as_json' do
    let(:network) { described_class.from_json(json_network) }

    it 'inverses #from_json' do
      expect(described_class.from_json(network.as_json)).to eq(network)
    end
  end
end
