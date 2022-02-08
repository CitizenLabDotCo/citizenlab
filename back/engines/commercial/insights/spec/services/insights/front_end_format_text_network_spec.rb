# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::FrontEndFormatTextNetwork do
  subject(:fe_network) { described_class.new(view, options) }

  let(:view) { create(:view) }
  let(:options) { { max_density: 1 } } # no density constraint by default

  describe '#id' do
    subject(:id) { fe_network.id }

    it { is_expected.to eq("network-#{view.id}") }
  end

  describe '#nodes' do
    subject(:nodes) { fe_network.nodes }

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

    context 'when node_size_range parameter is specified' do
      let(:options) do
        # picking very unlikely ranges to make sure sizes are rescaled
        { node_size_range: [217, 221] }
      end

      it "rescales 'val' attribute of keyword nodes accordingly" do
        vals = nodes.select { |node| node[:cluster_id] }.pluck(:val)
        expect(vals).to all(be_between(*options[:node_size_range]))
      end
    end

    context 'when max_nb_nodes parameter is specified' do
      let(:options) { { max_nb_nodes: 2 } }

      it 'reduces the nb of nodes accordingly' do
        expect(nodes.size).to eq(options[:max_nb_nodes])
      end
    end

    # rubocop:disable RSpec/MultipleMemoizedHelpers
    context 'when max_nb_clusters parameter is specified' do
      let(:nb_clusters) { networks.sum { |n| n.communities.count } }
      let(:options) { { max_nb_clusters: nb_clusters - 1 } }

      it 'reduces the nb of clusters accordingly' do
        expect(options[:max_nb_clusters]).to be > 0 # sanity check
        expect(nodes.pluck(:cluster_id).to_set.count).to eq(options[:max_nb_clusters])
      end
    end
    # rubocop:enable RSpec/MultipleMemoizedHelpers
  end

  describe '#links' do
    subject(:links) { fe_network.links }

    context 'when there are multiple networks (one per language)' do
      let!(:insights_networks) do
        %w[en fr].map { |l| create(:insights_text_network, view: view, language: l) }
      end
      let(:networks) { insights_networks.map(&:network) }

      it "returns the union of networks' links" do
        expected_nb_links = networks.sum { |network| network.links.size }
        expect(links.size).to eq(expected_nb_links)
      end
    end

    context 'when a maximum density is specified' do
      def graph_density(network)
        n = network.nodes.count
        max_nb_links = n * (n - 1) / 2
        network.links.count.to_f / max_nb_links
      end

      let(:network) { create(:insights_text_network, view: view).network }
      let(:actual_density) { graph_density(network) }
      let(:options) { { max_density: actual_density / 2 } }

      it 'reduces the network density by keeping only most important links' do
        expected_nb_links = (network.links.count.to_f / 2).ceil
        expected_weights = network.links.map(&:weight).sort.reverse.take(expected_nb_links)

        expect(links.pluck(:weight)).to match_array(expected_weights)
      end
    end
  end

  describe '.nodes' do
    subject(:nodes) { described_class.nodes(network) }

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
end
