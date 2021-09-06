# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::FrontEndFormatTextNetwork do
  subject(:fe_network) { described_class.new(view) }

  let(:view) { create(:view) }

  describe '#id' do
    subject(:id) { fe_network.id }

    it { is_expected.to eq("network-#{view.id}") }
  end

  describe '#nodes' do
    subject(:nodes) { fe_network.nodes }

    let(:languages) { %w[en fr] }
    let(:networks) { insights_networks.map(&:network) }

    let!(:insights_networks) do
      languages.map { |l| create(:insights_text_network, view: view, language: l) }
    end

    it 'identifiers are namespaced by language' do
      l1, l2 = languages
      expect(nodes.pluck(:id)).to all(start_with(l1).or(start_with(l2)))
    end

    it "returns the union of networks' nodes" do
      expect(nodes.size).to eq(
        networks.sum { |network| described_class.nodes(network).size }
      )
    end
  end

  describe '#links' do
    subject(:links) { fe_network.links }

    let!(:insights_networks) do
      %w[en fr].map { |l| create(:insights_text_network, view: view, language: l) }
    end
    let(:networks) { insights_networks.map(&:network) }

    it "returns the union of networks' links" do
      expect(links.size).to eq(
        networks.sum { |network| described_class.links(network).size }
      )
    end
  end

  describe '.nodes size' do
    using RSpec::Parameterized::TableSyntax
    subject { described_class.nodes(network).size }

    where(:network, :expected_size) do
      build(:nlp_text_network, nb_nodes: 1, nb_communities: 1) | 2
      build(:nlp_text_network, nb_nodes: 3, nb_communities: 2) | 5
      build(:nlp_text_network, nb_nodes: 2, nb_communities: 2) | 4
    end

    with_them do
      it { is_expected.to eq(expected_size) }
    end
  end

  describe '.keyword_nodes' do
    subject(:nodes) { described_class.keyword_nodes(network) }

    let(:network) { build(:nlp_text_network, nb_nodes: 3, nb_communities: 2) }

    it { expect(nodes.size).to eq(3) }

    it 'returns correctly formatted nodes' do
      community = network.communities.first
      node = community.children.first

      expected_node = {
        id: node.id,
        name: node.name,
        val: node.importance_score,
        cluster_id: community.id
      }

      expect(nodes).to include(expected_node)
    end
  end

  describe '.cluster_nodes' do
    subject(:nodes) { described_class.cluster_nodes(network) }

    let(:network) { build(:nlp_text_network, nb_nodes: 3, nb_communities: 2) }

    it { expect(nodes.size).to eq(2) }

    it 'returns correctly formatted nodes' do
      community = network.communities.first

      expected_node = {
        id: community.id,
        name: anything,
        val: community.importance_score,
        cluster_id: nil
      }

      expect(nodes).to include(expected_node)
    end
  end

  describe '.links size' do
    using RSpec::Parameterized::TableSyntax
    subject { described_class.links(network).size }

    where(:network, :min_size, :max_size) do
      build(:nlp_text_network, nb_nodes: 1, nb_communities: 1) | 1 | 1
      build(:nlp_text_network, nb_nodes: 3, nb_communities: 1) | 3 | 3
      build(:nlp_text_network, nb_nodes: 2, nb_communities: 2) | 2 | 3
      build(:nlp_text_network, nb_nodes: 4, nb_communities: 3) | 4 | 10 # 4 memberships + 3*2 cluster combinations
    end

    with_them do
      it { is_expected.to be >= min_size }
      it { is_expected.to be <= max_size }
    end
  end

  describe '.cluster_membership_links' do
    subject(:links) { described_class.cluster_membership_links(network) }

    let(:network) { build(:nlp_text_network, nb_nodes: 3, nb_communities: 2) }

    it { expect(links.size).to eq(3) }

    it 'returns correctly formatted links' do
      community = network.communities.first

      expected_link = {
        source: community.id,
        target: community.children.first.id
      }

      expect(links).to include(expected_link)
    end
  end

  describe '.inter_cluster_links' do
    subject(:links) { described_class.inter_cluster_links(fully_connected_network) }

    let(:nb_communities) { 4 }
    let(:nb_nodes) { 5 }
    let(:fully_connected_network) do
      build(
        :nlp_text_network,
        nb_nodes: nb_nodes,
        nb_links: nb_nodes * (nb_nodes - 1),
        nb_communities: nb_communities
      )
    end

    specify do
      # The network is fully connected => the graph of clusters is also fully connected.
      expected_nb_links = nb_communities * (nb_communities - 1) / 2
      expect(links.size).to eq(expected_nb_links)
    end

    it 'returns correctly formatted links' do
      c1, c2 = fully_connected_network.communities.take(2)

      link1 = { source: c1.id, target: c2.id }
      link2 = { source: c2.id, target: c1.id }

      expect(links).to include(link1).or include(link2)
    end
  end
end
