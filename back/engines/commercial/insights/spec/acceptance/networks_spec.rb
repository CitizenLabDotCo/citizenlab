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
      parameter :keyword_size_range, 'Keyword node size are linearly rescaled to fit into this range.'
      parameter :cluster_size_range, 'Cluster node size are linearly rescaled to fit into this range.'
    end

    let(:view) { create(:view) }
    let(:view_id) { view.id }
    let(:keyword_size_range) { [10, 20] }
    let(:cluster_size_range) { [25, 75] }

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
            expected_nb_nodes = networks.sum { |n| n.nodes.size + n.communities.size }
            expect(response_data.dig(:attributes, :nodes).size).to eq(expected_nb_nodes)

            min_nb_links = networks.sum { |n| n.nodes.size } # at least cluster membership links
            expect(response_data.dig(:attributes, :links).size).to be >= min_nb_links
          end
        end

        example 'rescales the node sizes according to parameters', document: false do
          do_request

          nodes = response_data.dig(:attributes, :nodes)
          keyword_nodes = nodes.select { |node| node[:cluster_id] }
          cluster_nodes = nodes.reject { |node| node[:cluster_id] }

          expect(keyword_nodes.pluck(:val)).to all(be_between(*keyword_size_range))
          expect(cluster_nodes.pluck(:val)).to all(be_between(*cluster_size_range))
        end
      end
    end

    include_examples 'unauthorized requests'
  end
end
