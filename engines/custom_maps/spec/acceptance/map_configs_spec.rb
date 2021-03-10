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
    include_examples 'unauthorized POST, PATCH and DELETE map config'
  end

  context 'when logged in as a normal user' do
    before do
      user_header_token
    end

    include_examples 'unauthorized POST, PATCH and DELETE map config'
  end

  context 'when logged in as an admin' do
    before do
      admin_header_token
    end

    post 'web_api/v1/projects/:project_id/map_config' do
      with_options scope: :map_config, required: true, with_example: true do
        parameter :zoom_level,      'The zoom level of the map'
        parameter :center_geojson,  'The coordinates of the map center as a GeoJSON object'
        parameter :tile_provider,   'The tile provider'
      end

      let!(:map_config_attributes) { attributes_for(:map_config, :with_tile_provider, :with_positioning) }

      let(:zoom_level)     { map_config_attributes[:zoom_level] }
      let(:center_geojson) { RGeo::GeoJSON.encode(map_config_attributes[:center]) }
      let(:tile_provider)  { map_config_attributes[:tile_provider] }

      example_request 'Creating a map config successfully' do
        expect(status).to eq 200
        expect(attributes['center_geojson']).to eq center_geojson
        expect(attributes['zoom_level']).to     eq zoom_level.to_f.to_s
        expect(attributes['tile_provider']).to  eq tile_provider
      end
    end

    patch 'web_api/v1/projects/:project_id/map_config' do
      with_options scope: :map_config, required: true, with_example: true do
        parameter :zoom_level,     'The zoom level of the map'
        parameter :center_geojson, 'The coordinates of the map center as a GeoJSON object'
        parameter :tile_provider,  'The tile provider'
      end

      let!(:map_config_attributes) { attributes_for(:map_config, :with_tile_provider, :with_positioning) }

      let(:zoom_level)      { map_config_attributes[:zoom_level] }
      let(:center_geojson)  { RGeo::GeoJSON.encode(map_config_attributes[:center]) }
      let(:tile_provider)   { map_config_attributes[:tile_provider] }

      context 'when the project already has a map config' do
        before do
          create(:map_config,
                 :with_positioning,
                 :with_tile_provider,
                 :with_layers,
                 :with_legend,
                 project: project)
        end

        example_request 'Updates a map config successfully' do
          expect(status).to eq 200
          expect(attributes['center_geojson']).to eq center_geojson
          expect(attributes['zoom_level']).to     eq zoom_level.to_f.to_s
          expect(attributes['tile_provider']).to  eq tile_provider
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
                 :with_layers,
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
