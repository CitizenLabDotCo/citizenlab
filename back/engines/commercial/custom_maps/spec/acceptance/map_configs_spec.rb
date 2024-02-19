# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Map Configs' do
  explanation <<~DESC.squish
    A map config defines how a map should be positioned, which layers it should display, which tile provider to use,
    and which Esri web map to use (if any).
    It can be associated with a project or a custom field.
  DESC

  let!(:custom_field_point) { create(:custom_field_point) }
  let(:json_response)       { JSON.parse(response_body, symbolize_names: false) }
  let(:attributes)          { json_response.dig('data', 'attributes').with_indifferent_access }

  before do
    header 'Content-Type', 'application/json'
  end

  shared_examples 'GET map_config' do
    get 'web_api/v1/map_configs/:map_config_id' do
      let!(:map_config) { create(:map_config, :with_tile_provider, :with_positioning, :with_esri_web_map_id) }
      let(:map_config_id) { map_config.id }

      example_request 'Get the map config' do
        expect(status).to eq 200
        expect(attributes['center_geojson']).to  eq map_config.center_geojson
        expect(attributes['zoom_level']).to      eq map_config.zoom_level.to_f.to_s
        expect(attributes['tile_provider']).to   eq map_config.tile_provider
        expect(attributes['esri_web_map_id']).to eq map_config.esri_web_map_id
        expect(json_response['data']['relationships']['mappable']['data'])
          .to eq({ 'id' => map_config.mappable_id, 'type' => map_config.mappable_type.underscore })
      end
    end
  end

  shared_examples 'unauthorized POST, PATCH and DELETE map config' do
    post 'web_api/v1/map_configs', document: false do
      example_request 'Cannot create a map config for a project' do
        expect(status).to eq 401
      end
    end

    patch 'web_api/v1/map_configs/:id', document: false do
      let(:id) { create(:map_config, mappable: nil).id }

      example_request 'Cannot update the map config for a project' do
        expect(status).to eq 401
      end
    end

    delete 'web_api/v1/map_configs/:id', document: false do
      let(:id) { create(:map_config, mappable: nil).id }

      example_request 'Cannot delete the map config for a project' do
        expect(status).to eq 401
      end
    end
  end

  shared_examples 'authorized POST map config' do
    post 'web_api/v1/map_configs' do
      with_options scope: :map_config, required: true, with_example: true do
        parameter :mappable_id,      'The ID of the mappable'
        parameter :mappable_type,    'The type of the mappable'
        parameter :zoom_level,      'The zoom level of the map'
        parameter :center_geojson,  'The coordinates of the map center as a GeoJSON object'
        parameter :tile_provider,   'The tile provider'
        parameter :esri_web_map_id, 'The ID of the Esri web map'
      end

      let!(:map_config_attributes) do
        attributes_for(:map_config, :with_tile_provider, :with_positioning, :with_esri_web_map_id)
      end

      let(:zoom_level)      { map_config_attributes[:zoom_level] }
      let(:center_geojson)  { RGeo::GeoJSON.encode(map_config_attributes[:center]) }
      let(:tile_provider)   { map_config_attributes[:tile_provider] }
      let(:esri_web_map_id) { map_config_attributes[:esri_web_map_id] }

      context 'when mappable is not specified' do
        example_request 'Create a map config' do
          expect(status).to eq 200
          expect(attributes['center_geojson']).to  eq center_geojson
          expect(attributes['zoom_level']).to      eq zoom_level.to_f.to_s
          expect(attributes['tile_provider']).to   eq tile_provider
          expect(attributes['esri_web_map_id']).to eq esri_web_map_id
          expect(json_response['data']['relationships']['mappable']['data']).to be_nil
        end
      end

      context 'when mappable params are specified' do
        let(:mappable_id)     { custom_field_point.id }
        let(:mappable_type)   { 'CustomField' }

        example_request 'Create a map config' do
          expect(json_response['data']['relationships']['mappable']['data'])
            .to eq({ 'id' => mappable_id, 'type' => mappable_type.underscore })
        end

        context 'when given mappable_id is not ID of existing mappable' do
          let(:mappable_id)     { SecureRandom.uuid }
          let(:mappable_type)   { 'Project' } # If we use 'CustomField', model validation :mappable_custom_field_is_input_type_point will fail first

          example_request '[error] Create a map config' do
            expect(status).to eq 422
            expect(json_response['errors']).to include('mappable' => [{ 'error' => 'blank' }])
          end
        end

        context 'when mappable is already associated with other map_config' do
          let!(:existing_map_config) { create(:map_config, mappable: custom_field_point) }

          let(:mappable_id)     { custom_field_point.id }
          let(:mappable_type)   { 'CustomField' }

          example_request '[error] Create a map config' do
            expect(status).to eq 422
            expect(json_response['errors']['mappable_id'][0]['error']).to eq 'taken'
          end
        end
      end
    end
  end

  shared_examples 'authorized PATCH map config' do
    patch 'web_api/v1/map_configs/:id' do
      with_options scope: :map_config, required: true, with_example: true do
        parameter :mappable_id,      'The ID of the mappable'
        parameter :mappable_type,    'The type of the mappable'
        parameter :zoom_level,      'The zoom level of the map'
        parameter :center_geojson,  'The coordinates of the map center as a GeoJSON object'
        parameter :tile_provider,   'The tile provider'
        parameter :esri_web_map_id, 'The ID of the Esri web map'
      end

      let!(:map_config) { create(:map_config, mappable: nil) }
      let(:id) { map_config.id }

      let(:zoom_level) { 11 }
      let(:center_geojson) { { type: 'Point', coordinates: [42.42, 24.24] } }
      let(:tile_provider) { 'https://fake-tile-provider.com/tiles' }
      let(:esri_web_map_id) { 'my-fake-esri-web-map-id-4242' }

      context 'when mappable is not specified' do
        example_request 'Update a map config' do
          expect(status).to eq 200
          expect(attributes['center_geojson']).to  eq 'coordinates' => [42.42, 24.24], 'type' => 'Point'
          expect(attributes['zoom_level']).to      eq '11.0'
          expect(attributes['tile_provider']).to   eq 'https://fake-tile-provider.com/tiles'
          expect(attributes['esri_web_map_id']).to eq 'my-fake-esri-web-map-id-4242'
          expect(json_response['data']['relationships']['mappable']['data']).to be_nil
        end

        # TODO: Test when mappable association exists?
      end

      context 'when mappable params are specified' do
        let(:mappable_id)     { custom_field_point.id }
        let(:mappable_type)   { 'CustomField' }

        example_request 'Update a map config' do
          expect(json_response['data']['relationships']['mappable']['data'])
            .to eq({ 'id' => mappable_id, 'type' => mappable_type.underscore })
        end

        context 'when given mappable_id is not ID of existing mappable' do
          let(:mappable_id)     { SecureRandom.uuid }
          let(:mappable_type)   { 'Project' } # If we use 'CustomField', model validation :mappable_custom_field_is_input_type_point will fail first

          example_request '[error] Update a map config' do
            expect(status).to eq 422
            expect(json_response['errors']).to include('mappable' => [{ 'error' => 'blank' }])
          end
        end

        context 'when mappable is already associated with other map_config' do
          let!(:existing_map_config) { create(:map_config, mappable: custom_field_point) }

          let(:mappable_id)     { custom_field_point.id }
          let(:mappable_type)   { 'CustomField' }

          example_request '[error] Update a map config' do
            expect(status).to eq 422
            expect(json_response['errors']['mappable_id'][0]['error']).to eq 'taken'
          end
        end
      end
    end
  end

  shared_examples 'authorized DELETE map config' do
    delete 'web_api/v1/map_configs/:id' do
      context 'when the map config is not associated with a mappable' do
        let!(:map_config) { create(:map_config, mappable: nil) }
        let(:id) { map_config.id }

        example_request 'Deletes a map config successfully' do
          expect(status).to eq 204
        end
      end

      context 'when the map config is associated with a mappable' do
        let!(:map_config) { create(:map_config, mappable: custom_field_point) }
        let(:id) { map_config.id }

        example_request 'Deletes a map config successfully' do
          expect(status).to eq 204
        end
      end
    end
  end

  context 'when not logged in' do
    include_examples 'GET map_config'
    include_examples 'unauthorized POST, PATCH and DELETE map config'
  end

  context 'when resident' do
    before { resident_header_token }

    include_examples 'GET map_config'
    include_examples 'unauthorized POST, PATCH and DELETE map config'
  end

  context 'when logged in as an admin' do
    before do
      admin_header_token
    end

    include_examples 'GET map_config'
    include_examples 'authorized POST map config'
    include_examples 'authorized PATCH map config'
    include_examples 'authorized DELETE map config'
  end

  context 'when logged in as a project moderator' do
    before do
      project = create(:project)
      header_token_for(create(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => project.id }]))
    end

    include_examples 'GET map_config'
    include_examples 'authorized POST map config'
    include_examples 'authorized PATCH map config'
    include_examples 'authorized DELETE map config'
  end
end
