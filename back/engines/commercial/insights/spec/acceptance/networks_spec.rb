# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Text networks' do
  explanation 'Text networks are graphs representing relationships between key concepts in a set of inputs.'

  before { header 'Content-Type', 'application/json' }

  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end

    context 'when normal user' do
      before { user_header_token }

      example 'unauthorized', document: false do
        do_request
        expect(status).to eq(401)
      end
    end
  end

  get 'web_api/v1/insights/views/:view_id/network' do
    with_options type: :array, items: { type: :number, minItems: 2, maxItems: 2 }, required: false, with_example: true do
      parameter :node_size_range, 'Keyword node size are linearly rescaled to fit into this range.'
      parameter :max_nb_nodes, 'Maximum number of keyword nodes.'
      parameter :max_nb_clusters, 'Maximum number of clusters.'
      parameter :max_density, <<~DESC
        Maximum density of the network (default = 0.05 ; 0 < density <= 1). The density 
        of a network (graph) is defined as the ratio of the number of edges (links) to the 
        number of possible edges in a network with the same number of nodes. 

        Setting this parameter to 1 does constrain the network density. Smaller values
        will cause the network to omit links with smaller weights to maintain the density 
        below the given threshold. The number of links that are kept is rounded up.
      DESC
    end

    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let(:max_density) { 1 } # By default, don't set density constraints for tests (-> don't drop links).

    context 'when admin' do
      before { admin_header_token }

      context 'when there is no network associated to the view (yet)' do
        example 'returns 404', document: false do
          do_request
          expect(status).to eq(404)
        end
      end

      context 'when a network is available' do
        let(:languages) { %w[en fr-BE] }
        let!(:networks) do
          languages.map do |language|
            create(:insights_text_network, view: view, language: language).network
          end
        end

        example_request "returns the network representation of the view's inputs" do
          expect(status).to eq(200)

          aggregate_failures 'check response' do
            expected_nb_nodes = networks.sum { |n| n.nodes.size }
            expect(response_data.dig(:attributes, :nodes).size).to eq(expected_nb_nodes)

            min_nb_links = networks.sum { |n| n.nodes.size } # at least cluster membership links
            expect(response_data.dig(:attributes, :links).size).to be >= min_nb_links
          end
        end

        context 'when node_size_range parameter is specified' do
          let(:node_size_range) { '[10, 20]' }

          example 'rescales the node values accordingly', document: false do
            do_request

            nodes = response_data.dig(:attributes, :nodes)
            expected_range = JSON.parse(node_size_range)
            expect(nodes.pluck(:val)).to all(be_between(*expected_range))
          end
        end

        context 'when max_nb_nodes parameter is specified' do
          let(:max_nb_nodes) { 3 }

          example 'keeps only the most important nodes', document: false do
            # Check that there was indeed more nodes in the first place.
            all_nodes = networks.flat_map(&:nodes)
            expect(max_nb_nodes).to be < all_nodes.size

            do_request

            # The check is a bit convoluted because both the scores and the ids are changed:
            # - scores are rescaled
            # - ids are prefixed by a namespace
            nodes = response_data.dig(:attributes, :nodes)
            expected_node_ids = all_nodes.sort_by(&:importance_score).reverse.take(nodes.size).map(&:id)
            actual_node_ids = nodes.pluck(:id).map { |id| id.split('/')[1] } # we need to remove the namespace prefix
            expect(actual_node_ids).to match_array(expected_node_ids)
          end
        end

        context 'when max_density parameter is specified' do
          let(:max_density) { 1e-10 } # so small it should keep only 1 link

          example 'keeps only the most important links', document: false do
            do_request

            max_weight = networks.flat_map(&:links).map(&:weight).max

            links = response_data.dig(:attributes, :links)
            expect(links.count).to eq(1)
            expect(links.first[:weight]).to eq(max_weight)
          end
        end
      end
    end

    include_examples 'unauthorized requests'
  end
end
