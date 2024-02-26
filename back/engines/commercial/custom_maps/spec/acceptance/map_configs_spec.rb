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
          :with_esri_web_map_id,
          :with_esri_base_map_id,
          :with_geojson_layers,
          :with_legend,
          project: project)
      end

      example_request 'Get the map config of a project' do
        expect(status).to eq 200

        expect(attributes['center_geojson']).to eq(map_config.center_geojson)
        expect(attributes['tile_provider']).to eq map_config.tile_provider
        expect(attributes['zoom_level']).to eq map_config.zoom_level.to_s
        expect(attributes['esri_web_map_id']).to eq map_config.esri_web_map_id
        expect(attributes['esri_base_map_id']).to eq map_config.esri_base_map_id
        expect(attributes['layers'][0]['title_multiloc']).to eq map_config.layers.first.title_multiloc
        expect(attributes['layers'][0]['geojson']).to eq map_config.layers.first.geojson
        expect(attributes['layers'][0]['default_enabled']).to eq map_config.layers.first.default_enabled
        expect(attributes['layers'][0]['marker_svg_url']).to eq map_config.layers.first.marker_svg_url
        expect(attributes['legend'][0]['title_multiloc']).to eq map_config.legend_items.first.title_multiloc
        expect(attributes['legend'][0]['color']).to eq map_config.legend_items.first.color
      end
    end
  end

  shared_examples 'unauthorized POST, PATCH and DELETE map config' do
    post 'web_api/v1/projects/:project_id/map_config' do
      example_request 'Cannot create a map config for a project' do
        expect(status).to eq 401
      end
    end

    patch 'web_api/v1/projects/:project_id/map_config' do
      example_request 'Cannot update the map config for a project' do
        expect(status).to eq 401
      end
    end

    delete 'web_api/v1/projects/:project_id/map_config' do
      example_request 'Cannot delete the map config for a project' do
        expect(status).to eq 401
      end
    end
  end

  context 'when not logged in' do
    include_examples 'successful GET map config'
    include_examples 'unauthorized POST, PATCH and DELETE map config'
  end

  context 'when resident' do
    before { resident_header_token }

    include_examples 'successful GET map config'
    include_examples 'unauthorized POST, PATCH and DELETE map config'
  end

  context 'when logged in as an admin' do
    before do
      admin_header_token
    end

    include_examples 'successful GET map config'

    post 'web_api/v1/projects/:project_id/map_config' do
      with_options scope: :map_config, required: true, with_example: true do
        parameter :zoom_level,      'The zoom level of the map'
        parameter :center_geojson,  'The coordinates of the map center as a GeoJSON object'
        parameter :tile_provider,   'The tile provider'
        parameter :esri_web_map_id, 'The ID of the Esri web map'
        parameter :esri_base_map_id, 'The ID of the Esri base map'
      end

      let!(:map_config_attributes) do
        attributes_for(
          :map_config,
          :with_tile_provider,
          :with_positioning,
          :with_esri_web_map_id,
          :with_esri_base_map_id
        )
      end

      let(:zoom_level)     { map_config_attributes[:zoom_level] }
      let(:center_geojson) { RGeo::GeoJSON.encode(map_config_attributes[:center]) }
      let(:tile_provider)  { map_config_attributes[:tile_provider] }
      let(:esri_web_map_id)  { map_config_attributes[:esri_web_map_id] }
      let(:esri_base_map_id)  { map_config_attributes[:esri_base_map_id] }

      example_request 'Creating a map config successfully' do
        expect(status).to eq 200
        expect(attributes['center_geojson']).to  eq center_geojson
        expect(attributes['zoom_level']).to      eq zoom_level.to_f.to_s
        expect(attributes['tile_provider']).to   eq tile_provider
        expect(attributes['esri_web_map_id']).to eq esri_web_map_id
        expect(attributes['esri_base_map_id']).to eq esri_base_map_id
      end
    end

    patch 'web_api/v1/projects/:project_id/map_config' do
      with_options scope: :map_config, required: true, with_example: true do
        parameter :zoom_level,     'The zoom level of the map'
        parameter :center_geojson, 'The coordinates of the map center as a GeoJSON object'
        parameter :tile_provider,  'The tile provider'
        parameter :esri_web_map_id, 'The ID of the Esri web map'
        parameter :esri_base_map_id, 'The ID of the Esri base map'
      end

      let!(:map_config_attributes) { attributes_for(:map_config, :with_tile_provider, :with_positioning) }

      let(:zoom_level) { 11 }
      let(:center_geojson) { { type: 'Point', coordinates: [42.42, 24.24] } }
      let(:tile_provider) { 'https://fake-tile-provider.com/tiles' }
      let(:esri_web_map_id) { 'my-fake-esri-web-map-id-4242' }
      let(:esri_base_map_id) { 'my-fake-esri-base-map-id-9090' }

      context 'when the project already has a map config' do
        before do
          create(:map_config,
            :with_positioning,
            :with_tile_provider,
            :with_esri_feature_layers,
            :with_legend,
            project: project)
        end

        example_request 'Updates a map config successfully' do
          expect(status).to eq 200
          expect(attributes['center_geojson']).to  eq 'coordinates' => [42.42, 24.24], 'type' => 'Point'
          expect(attributes['zoom_level']).to      eq '11.0'
          expect(attributes['tile_provider']).to   eq 'https://fake-tile-provider.com/tiles'
          expect(attributes['esri_web_map_id']).to eq 'my-fake-esri-web-map-id-4242'
          expect(attributes['esri_base_map_id']).to eq 'my-fake-esri-base-map-id-9090'
        end
      end

      context 'when the project does not have a map config' do
        example_request 'Cannot update the map config' do
          expect(status).to eq 404
        end
      end
    end

    delete 'web_api/v1/projects/:project_id/map_config' do
      context 'when the project already has a map config' do
        before do
          create(:map_config,
            :with_positioning,
            :with_tile_provider,
            :with_esri_web_map_id,
            :with_esri_base_map_id,
            :with_geojson_layers,
            :with_legend,
            project: project)
        end

        example_request 'Deletes a map config successfully' do
          expect(status).to eq 204
        end
      end

      context 'when the project does not have a map config' do
        example_request 'Cannot delete a map config' do
          expect(status).to eq 404
        end
      end
    end
  end
end
