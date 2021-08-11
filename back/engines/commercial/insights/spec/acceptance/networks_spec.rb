# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Text networks' do
  explanation 'Text networks are graphs representing relationships between key concepts in a set of inputs.'

  before { header 'Content-Type', 'application/json' }

  let(:json_response) { json_parse(response_body) }

  shared_examples 'unauthorized requests' do
    context 'when visitor' do
      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end

    context 'when normal user' do
      before { user_header_token }

      example_request('unauthorized', document: false) { expect(status).to eq(401) }
    end
  end

  get 'web_api/v1/insights/views/:view_id/network' do
    let(:view) { create(:view) }
    let(:view_id) { view.id }

    context 'when admin' do
      before { admin_header_token }

      context 'when there is no network associated to the view (yet)' do
        example_request 'returns 404' do
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
      end
    end

    include_examples 'unauthorized requests'
  end
end
