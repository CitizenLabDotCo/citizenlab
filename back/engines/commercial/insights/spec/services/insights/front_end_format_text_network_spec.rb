# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::FrontEndFormatTextNetwork do
  subject(:fe_network) { described_class.new(view, options) }

  let(:view) { create(:view) }
  let(:options) { {} }

  describe '#id' do
    subject(:id) { fe_network.id }

    it { is_expected.to eq("network-#{view.id}") }
  end

  describe '#nodes' do
    subject(:nodes) { fe_network.nodes }

    let(:options) do
      # picking very unlikely ranges to make sure sizes are rescaled
      { keyword_size_range: [217, 221] }
    end
    let(:languages) { %w[en fr] }
    let!(:insights_networks) { languages.map { |l| create(:insights_text_network, view: view, language: l) } }
    let(:networks) { insights_networks.map(&:network) }

    it 'identifiers are namespaced by language' do
      l1, l2 = languages
      expect(nodes.pluck(:id)).to all(start_with(l1).or(start_with(l2)))
    end

    it "returns the union of networks' nodes" do
      expect(nodes.size).to eq(
        networks.sum { |network| described_class.nodes(network).size }
      )
    end

    it "rescales 'val' attribute of keyword nodes" do
      vals = nodes.select { |node| node[:cluster_id] }.pluck(:val)
      expect(vals).to all(be_between(*options[:keyword_size_range]))
    end

    it 'has a one-to-one relationship between clusters and colors' do
      # Compute mapping between clusters (ids) and their colors.
      cluster_colors = nodes.group_by { |n| n[:cluster_id] }.transform_values do |nodes|
        nodes.pluck(:color_index).uniq
      end

      aggregate_failures('check clusters have only 1 color') do
        expect(cluster_colors.values.map(&:size)).to all(eq(1))
      end

      # Clusters have different colors.
      colors = cluster_colors.values.flatten
      expect(colors).to eq(colors.uniq)
    end

    it 'abides to the limits on the nb of nodes' do
      view = create(:view).tap do |view|
        nlp_network = build(:nlp_text_network, nb_nodes: 20, nb_communities: 5)
        create(:insights_text_network, view: view, network: nlp_network)
      end

      fe_network = described_class.new(view, max_nb_clusters: 3, max_nb_kw_per_cluster: 2)
      counts_by_cluster = fe_network.nodes.group_by { |n| n[:cluster_id] }
                                    .transform_values(&:count)

      aggregate_failures('checking nb of nodes') do
        expect(counts_by_cluster.values).to all eq(2)
        expect(counts_by_cluster.size).to eq(3)
      end
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

  describe '.nodes' do
    using RSpec::Parameterized::TableSyntax
    subject { described_class.nodes(network).size }

    describe 'size (nb of nodes)' do
      where(:network, :expected_size) do
        build(:nlp_text_network, nb_nodes: 1, nb_communities: 1) | 1
        build(:nlp_text_network, nb_nodes: 3, nb_communities: 2) | 3
        build(:nlp_text_network, nb_nodes: 2, nb_communities: 2) | 2
      end

      with_them do
        it { is_expected.to eq(expected_size) }
      end
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
        val: be_between(1, 5),
        cluster_id: community.id,
        color_index: be_an(Integer)
      }

      expect(nodes).to include(expected_node)
    end
  end

  describe '.links size' do
    using RSpec::Parameterized::TableSyntax
    subject { described_class.links(network).size }

    where(:network, :min_size, :max_size) do
      build(:nlp_text_network, nb_nodes: 1, nb_communities: 1) # a single node
      build(:nlp_text_network, nb_nodes: 5, nb_communities: 1) # all nodes as a single community
      build(:nlp_text_network, nb_nodes: 4, nb_communities: 2) # 2 nodes / community
    end

    with_them do
      it { is_expected.to eq(network.links.size) }
    end
  end
end
