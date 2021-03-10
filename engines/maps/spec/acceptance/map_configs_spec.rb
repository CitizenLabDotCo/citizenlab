# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Map Configs' do
  explanation 'A map config defines how a project map should be positioned and which layers it should display'

  let!(:project)      { create(:project) }
  let(:project_id)    { project.id }
  let(:json_response) { JSON.parse(response_body, symbolize_names: false) }
  let(:attributes)    { json_response.dig('data', 'attributes').with_indifferent_access }

  before do
    header 'Content-Type', 'application/json'
  end

  shared_examples 'successful GET map config' do
    get 'web_api/v1/projects/:project_id/map_config' do
      let!(:map_config) do
        create(:map_config,
               :with_positioning,
               :with_tile_provider,
               :with_layers,
               :with_legend,
               project: project)
      end

      example_request 'Get the map config of a project' do
        expect(status).to eq 200

        expect(attributes['center_geojson']).to eq(map_config.center_geojson)
        expect(attributes['tile_provider']).to eq map_config.tile_provider
        expect(attributes['zoom_level']).to eq map_config.zoom_level.to_s
        expect(attributes['layers'][0]['title_multiloc']).to eq map_config.layers.first.title_multiloc
        expect(attributes['layers'][0]['geojson']).to eq map_config.layers.first.geojson
        expect(attributes['layers'][0]['default_enabled']).to eq map_config.layers.first.default_enabled
        expect(attributes['layers'][0]['marker_svg_url']).to eq map_config.layers.first.marker_svg_url
        expect(attributes['legend'][0]['title_multiloc']).to eq map_config.legend_items.first.title_multiloc
        expect(attributes['legend'][0]['color']).to eq map_config.legend_items.first.color
      end
    end
  end

  context 'when not logged in' do
    include_examples 'successful GET map config'
  end

  context 'when logged in as a normal user' do
    before do
      user_header_token
    end

    include_examples 'successful GET map config'
  end

  context 'when logged in as an admin' do
    before do
      admin_header_token
    end

    include_examples 'successful GET map config'
  end
end
