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

  describe '#prune_communities' do
    let(:network) { build(:nlp_text_network, nb_nodes: 3, nb_communities: 3) }

    # rubocop:disable RSpec/MultipleExpectations
    it 'keeps only n communities' do
      removed_communities = network.prune_communities(2)
      expect(network.communities.count).to eq(2)
      expect(removed_communities.count).to eq(1)
    end

    it 'removes nodes belonging to pruned communities' do
      pruned_community = network.prune_communities(2).first

      expect(pruned_community.children & network.nodes).to be_empty
      expect(network.nodes).to match_array(network.communities.flat_map(&:children))
    end
    # rubocop:enable RSpec/MultipleExpectations

    it 'keeps only the most important communities' do
      max_importance = network.communities.map(&:importance_score).max
      network.prune_communities(1)

      expect(network.communities.first.importance_score).to eq(max_importance)
    end

    it 'removes links from/to the pruned communities' do
      removed_communities = network.prune_communities(1)
      removed_nodes = removed_communities.flat_map(&:children)
      links_nodes = (network.links.map(&:from_node) + network.links.map(&:to_node)).uniq

      expect(links_nodes & removed_nodes).to be_empty
    end
  end

  describe '#shrink_communities' do
    let(:network) { build(:nlp_text_network, nb_nodes: 5, nb_communities: 1) }

    it 'keeps only n nodes' do
      network = build(:nlp_text_network, nb_nodes: 6, nb_communities: 2)
      network.shrink_communities(2)

      child_counts = network.communities.map {|c| c.children.count }
      expect(child_counts).to all(be <= 2)
    end

    it 'keeps the most important nodes' do
      max_importance = network.communities.first.children.map(&:importance_score).max
      network.shrink_communities(1)

      child_node = network.communities.first.children.first
      expect(child_node.importance_score).to eq(max_importance)
    end

    it 'updates the list of nodes of the network' do
      network.shrink_communities(3)
      expect(network.nodes).to match_array(network.communities.first.children)
    end

    it 'removes dangling links' do
      # simplified case: If there is only 1 node left, there can be links.
      network.shrink_communities(1)
      expect(network.links).to be_empty
    end
  end
end
