# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Map Layers' do
  explanation 'Map layers are visual blocks that can be displayed on top of maps, like markers, polygons or lines.'

  let!(:geojson_map_project) { create(:project) }
  let!(:geojson_map_config) do
    create(:map_config,
      :with_positioning,
      :with_tile_provider,
      :with_geojson_layers,
      :with_legend,
      project: geojson_map_project)
  end
  let(:geojson_map_project_id) { geojson_map_project.id }

  let!(:esri_map_project) { create(:project) }
  let!(:esri_map_config) do
    create(:map_config,
      :with_positioning,
      :with_tile_provider,
      :with_esri_layers,
      :with_legend,
      project: esri_map_project)
  end
  let(:esri_map_project_id) { esri_map_project.id }

  let(:json_response) { JSON.parse(response_body, symbolize_names: false) }
  let(:attributes)    { json_response.dig('data', 'attributes').with_indifferent_access }

  before do
    header 'Content-Type', 'application/json'
  end

  shared_examples 'successful GET map GeoJSON layers' do
    get 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id' do
      let(:layer) { geojson_map_config.layers.first }
      let(:id)    { layer.id }

      example_request 'Get a GeoJSON map layer of a project' do
        assert_status 200
        expect(attributes['title_multiloc']).to   eq layer.title_multiloc
        expect(attributes['type']).to             eq layer.type
        expect(attributes['geojson']).to          eq layer.geojson
        expect(attributes['layer_url']).to        be_nil # Not serialized for GeojsonLayer
        expect(attributes['default_enabled']).to  eq layer.default_enabled
        expect(attributes['marker_svg_url']).to   eq layer.marker_svg_url
        expect(attributes['ordering']).to         eq layer.ordering
      end
    end
  end

  shared_examples 'successful GET map Esri layers' do
    get 'web_api/v1/projects/:esri_map_project_id/map_config/layers/:id' do
      let(:layer) { esri_map_config.layers.first }
      let(:id)    { layer.id }

      example_request 'Get a Esri map layer of a project' do
        assert_status 200
        expect(attributes['title_multiloc']).to   eq layer.title_multiloc
        expect(attributes['type']).to             eq layer.type
        expect(attributes['geojson']).to          be_nil # Not serialized for EsriLayer
        expect(attributes['layer_url']).to        eq layer.layer_url
        expect(attributes['default_enabled']).to  eq layer.default_enabled
        expect(attributes['marker_svg_url']).to   eq layer.marker_svg_url
        expect(attributes['ordering']).to         eq layer.ordering
      end
    end
  end

  shared_examples 'unauthorized POST, PATCH and DELETE map layer' do
    post 'web_api/v1/projects/:geojson_map_project_id/map_config/layers', document: false do
      example_request 'Cannot create a map config for a project' do
        expect(status).to eq 401
      end
    end

    patch 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id', document: false do
      let(:layer) { geojson_map_config.layers.first }
      let(:id)    { layer.id }

      example_request 'Cannot update the map config for a project' do
        expect(status).to eq 401
      end
    end

    patch 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id/reorder', document: false do
      let(:layer) { geojson_map_config.layers.first }
      let(:id)    { layer.id }

      example_request 'Cannot update the map config for a project' do
        expect(status).to eq 401
      end
    end

    delete 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id', document: false do
      let(:layer) { geojson_map_config.layers.first }
      let(:id)    { layer.id }

      example_request 'Cannot delete the map config for a project' do
        expect(status).to eq 401
      end
    end
  end

  shared_examples 'POST GeoJSON map layer' do
    post 'web_api/v1/projects/:geojson_map_project_id/map_config/layers' do
      with_options scope: :layer, required: true, with_example: true do
        parameter :title_multiloc,  'The name of the layer in multiple locales'
        parameter :type,            'The type of the layer (CustomMaps::GeojsonLayer or CustomMaps::EsriLayer)', required: true
        parameter :geojson,         '[Option 1] The GeoJSON object with all the specs for the layer', required: false
        parameter :geojson_file,    '[Option 2] The GeoJSON file with all the specs for the layer (required if geojson type)', required: false
        parameter :layer_url,       'url layer of non-geojson layer type (required, if non-geojson type)', required: false
        parameter :default_enabled, 'The setting that determines whether a label is visible'
        parameter :marker_svg_url,  'The url for an svg marker [DEPRECATED, prefer GeoJSON properties instead]'
      end

      let!(:layer_attributes) { attributes_for(:geojson_layer, :with_marker_svg) }

      let(:type)            { layer_attributes[:type] }
      let(:default_enabled) { layer_attributes[:default_enabled] }
      let(:marker_svg_url)  { layer_attributes[:marker_svg_url] }
      let(:title_multiloc)  { layer_attributes[:title_multiloc] }
      let(:ordering)        { geojson_map_config.layers.length - 1 }

      context 'when passing a geojson object' do
        let(:geojson) { layer_attributes[:geojson] }

        example_request 'Creates a map layer successfully using a geojson object' do
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::GeojsonLayer'
          expect(attributes['geojson']).to         eq geojson
          expect(attributes['layer_url']).to       be_nil # Not serialized for GeojsonLayer
          expect(attributes['default_enabled']).to be true
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing a geojson file' do
        let(:geojson_file) do
          {
            base64: encode_json_file_as_base64('seattle.geojson'),
            filename: 'seattle.geojson'
          }
        end

        example_request 'Creates a map layer successfully using a geojson file' do
          geojson = JSON.parse(Base64.decode64(geojson_file[:base64].gsub('data:application/json;base64,', '')))
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::GeojsonLayer'
          expect(attributes['geojson']).to         eq geojson
          expect(attributes['layer_url']).to       be_nil # Not serialized for GeojsonLayer
          expect(attributes['default_enabled']).to be true
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing both a geojson object and file' do
        let(:geojson) { layer_attributes[:geojson] }

        let(:geojson_file) do
          {
            base64: encode_json_file_as_base64('brussels-districts.geojson'),
            filename: 'brussels-districts.geojson'
          }
        end

        example_request 'Creates a map layer successfully using the geojson object' do
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::GeojsonLayer'
          expect(attributes['geojson']).to         eq geojson
          expect(attributes['layer_url']).to       be_nil # Not serialized for GeojsonLayer
          expect(attributes['default_enabled']).to be true
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing no geojson object or file' do
        example_request 'Fails to create a map layer' do
          assert_status 422
        end
      end
    end
  end

  shared_examples 'PATCH GeoJSON map layer' do
    patch 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id' do
      with_options scope: :layer, required: true, with_example: true do
        parameter :title_multiloc,  'The name of the layer in multiple locales'
        parameter :type,            'The type of the layer (CustomMaps::GeojsonLayer or CustomMaps::EsriLayer)', required: true
        parameter :geojson,         'The GeoJSON object with all the specs for the layer', required: false
        parameter :geojson_file,    'The GeoJSON file with all the specs for the layer', required: false
        parameter :layer_url,       'url layer of non-geojson layer type (required, if non-geojson type)', required: false
        parameter :default_enabled, 'The setting that determines whether a label is visible'
        parameter :marker_svg_url,  'The url for an svg marker [DEPRECATED, prefer GeoJSON properties instead]'
      end

      let(:layer) { geojson_map_config.layers.first }
      let(:id)    { layer.id }

      let!(:layer_attributes) { attributes_for(:geojson_layer, :with_marker_svg) }

      let(:default_enabled) { false }
      let(:marker_svg_url)  { 'https://some_new_url.com' }
      let(:title_multiloc)  { { 'en' => 'new layer title' } }
      let(:ordering)        { 0 }

      context 'when passing a geojson object' do
        let(:geojson) { JSON.parse(File.read(CustomMaps::Engine.root.join('spec/fixtures/brussels-districts.geojson'))) }

        example_request 'Updates the layer successfully using a geojson object' do
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::GeojsonLayer'
          expect(attributes['geojson']).to         eq geojson
          expect(attributes['layer_url']).to       be_nil # Not serialized for GeojsonLayer
          expect(attributes['default_enabled']).to eq default_enabled
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing a geojson file' do
        let(:geojson_file) do
          {
            base64: encode_json_file_as_base64('brussels-districts.geojson'),
            filename: 'seattle.geojson'
          }
        end

        example_request 'Updates a map layer successfully using a geojson file' do
          geojson = JSON.parse(Base64.decode64(geojson_file[:base64].gsub('data:application/json;base64,', '')))
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::GeojsonLayer'
          expect(attributes['geojson']).to         eq geojson
          expect(attributes['layer_url']).to       be_nil # Not serialized for GeojsonLayer
          expect(attributes['default_enabled']).to eq default_enabled
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing both a geojson object and file' do
        let(:geojson) { JSON.parse(File.read(CustomMaps::Engine.root.join('spec/fixtures/brussels-districts.geojson'))) }

        let(:geojson_file) do
          {
            base64: encode_json_file_as_base64('bruxelles_toilettes_publiques.geojson'),
            filename: 'brussels-public-toilets.geojson'
          }
        end

        example_request 'Updates a map layer successfully using the geojson object' do
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::GeojsonLayer'
          expect(attributes['geojson']).to         eq geojson
          expect(attributes['layer_url']).to       be_nil # Not serialized for GeojsonLayer
          expect(attributes['default_enabled']).to eq default_enabled
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing no geojson object or file' do
        example_request 'Fails to update a map layer' do
          assert_status 422
        end
      end
    end
  end

  shared_examples 'Reorder GeoJSON map layer' do
    patch 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id/reorder' do
      with_options scope: :layer, required: true, with_example: true do
        parameter :ordering, 'The new ordering of the layer'
      end

      let(:ordering) { 2 }

      context 'when the project already has a map config with multiple layers' do
        let(:layer) { geojson_map_config.layers.first }
        let(:id)    { layer.id }

        before do
          create_list(:layer, 5, map_config: geojson_map_config)
        end

        example_request 'Reorders a map layer successfully' do
          expect(status).to                 eq 200
          expect(attributes['ordering']).to eq ordering
        end
      end

      context 'when the map layer id does not exist' do
        let(:id) { 'random id' }

        example_request 'Cannot reorder the map layer' do
          expect(status).to eq 404
        end
      end
    end
  end

  shared_examples 'POST Esri map layer' do
    post 'web_api/v1/projects/:esri_map_project_id/map_config/layers' do
      with_options scope: :layer, required: true, with_example: true do
        parameter :title_multiloc,  'The name of the layer in multiple locales'
        parameter :type,            'The type of the layer (CustomMaps::GeojsonLayer or CustomMaps::EsriLayer)', required: true
        parameter :geojson,         '[Option 1] The GeoJSON object with all the specs for the layer', required: false
        parameter :geojson_file,    '[Option 2] The GeoJSON file with all the specs for the layer (required if geojson type)', required: false
        parameter :layer_url,       'url layer of non-geojson layer type (required, if non-geojson type)', required: false
        parameter :default_enabled, 'The setting that determines whether a label is visible'
        parameter :marker_svg_url,  'The url for an svg marker [DEPRECATED, prefer GeoJSON properties instead]'
      end

      let!(:layer_attributes) { attributes_for(:esri_layer, :with_marker_svg) }

      let(:type)            { layer_attributes[:type] }
      let(:default_enabled) { layer_attributes[:default_enabled] }
      let(:marker_svg_url)  { layer_attributes[:marker_svg_url] }
      let(:title_multiloc)  { layer_attributes[:title_multiloc] }
      let(:ordering)        { esri_map_config.layers.length - 1 }

      context 'when passing a layer_url' do
        let(:layer_url) { 'https://some.domain.com/some_layer' }

        example_request 'Creates a map layer successfully using a url' do
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::EsriLayer'
          expect(attributes['geojson']).to         be_nil # Not serialized for EsriLayer
          expect(attributes['layer_url']).to       eq layer_url
          expect(attributes['default_enabled']).to be true
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing no url' do
        example_request 'Fails to create a map layer' do
          assert_status 422
        end
      end
    end
  end

  shared_examples 'PATCH Esri map layer' do
    patch 'web_api/v1/projects/:esri_map_project_id/map_config/layers/:id' do
      with_options scope: :layer, required: true, with_example: true do
        parameter :title_multiloc,  'The name of the layer in multiple locales'
        parameter :type,            'The type of the layer (CustomMaps::GeojsonLayer or CustomMaps::EsriLayer)', required: true
        parameter :geojson,         'The GeoJSON object with all the specs for the layer', required: false
        parameter :geojson_file,    'The GeoJSON file with all the specs for the layer', required: false
        parameter :layer_url,       'url layer of non-geojson layer type (required, if non-geojson type)', required: false
        parameter :default_enabled, 'The setting that determines whether a label is visible'
        parameter :marker_svg_url,  'The url for an svg marker [DEPRECATED, prefer GeoJSON properties instead]'
      end

      let(:layer) { esri_map_config.layers.first }
      let(:id)    { layer.id }

      let!(:layer_attributes) { attributes_for(:esri_layer, :with_marker_svg) }

      let(:default_enabled) { false }
      let(:marker_svg_url)  { 'https://some_new_url.com' }
      let(:title_multiloc)  { { 'en' => 'new layer title' } }
      let(:ordering)        { 0 }

      context 'when passing a url' do
        let(:layer_url) { 'https://some.domain.com/some_layer' }

        example_request 'Updates a map layer successfully using a url' do
          assert_status 200
          expect(attributes['title_multiloc']).to  eq title_multiloc
          expect(attributes['type']).to            eq 'CustomMaps::EsriLayer'
          expect(attributes['geojson']).to         be_nil # Not serialized for EsriLayer
          expect(attributes['layer_url']).to       eq layer_url
          expect(attributes['default_enabled']).to be default_enabled
          expect(attributes['marker_svg_url']).to  eq marker_svg_url
          expect(attributes['ordering']).to        eq ordering
        end
      end

      context 'when passing no url' do
        let(:layer_url) { nil }

        example_request 'Fails to update a map layer' do
          assert_status 422
        end
      end
    end
  end

  shared_examples 'DELETE GeoJSON map layer' do
    delete 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id' do
      context 'when the project already has a map layer' do
        let(:layer) { geojson_map_config.layers.first }
        let(:id)    { layer.id }

        example_request 'Deletes a GeoJSON map layer successfully' do
          expect(status).to eq 204
        end
      end

      context 'when the map layer id does not exist' do
        let(:id) { 'random id' }

        example_request 'Cannot delete a map layer' do
          expect(status).to eq 404
        end
      end
    end
  end

  context 'when not logged in' do
    include_examples 'successful GET map GeoJSON layers'
    include_examples 'successful GET map Esri layers'
    include_examples 'unauthorized POST, PATCH and DELETE map layer'
  end

  context 'when resident' do
    before { resident_header_token }

    include_examples 'successful GET map GeoJSON layers'
    include_examples 'successful GET map Esri layers'
    include_examples 'unauthorized POST, PATCH and DELETE map layer'
  end

  context 'when logged in as an admin' do
    before do
      admin_header_token
    end

    include_examples 'successful GET map GeoJSON layers'
    include_examples 'successful GET map Esri layers'
    include_examples 'POST GeoJSON map layer'
    include_examples 'PATCH GeoJSON map layer'
    include_examples 'Reorder GeoJSON map layer'
    include_examples 'POST Esri map layer'
    include_examples 'PATCH Esri map layer'
    include_examples 'DELETE GeoJSON map layer'

    context 'when attempting to update layer type' do
      patch 'web_api/v1/projects/:esri_map_project_id/map_config/layers/:id' do
        with_options scope: :layer, required: true, with_example: true do
          parameter :type,            'The type of the layer (CustomMaps::GeojsonLayer or CustomMaps::EsriLayer)', required: true
          parameter :geojson_file,    'The GeoJSON file with all the specs for the layer', required: false
          parameter :title_multiloc,  'The name of the layer in multiple locales'
        end

        let(:layer) { esri_map_config.layers.first }
        let(:id)    { layer.id }

        context 'when attempting to change to an Geojson layer' do
          let(:type) { 'CustomMaps::GeojsonLayer' }
          let(:geojson_file) do
            {
              base64: encode_json_file_as_base64('brussels-districts.geojson'),
              filename: 'seattle.geojson'
            }
          end
          let(:title_multiloc) { { 'en' => 'new layer title' } }

          example 'Fails to update the map layer type', document: false do
            do_request
            assert_status 200

            updated_layer = CustomMaps::Layer.find(layer.id)
            expect(updated_layer.type).to eq 'CustomMaps::EsriLayer'
            expect(updated_layer.title_multiloc).to eq({ 'en' => 'new layer title' })
          end
        end
      end

      patch 'web_api/v1/projects/:geojson_map_project_id/map_config/layers/:id' do
        with_options scope: :layer, required: true, with_example: true do
          parameter :type,      'The type of the layer (CustomMaps::GeojsonLayer or CustomMaps::EsriLayer)', required: true
          parameter :layer_url, 'url layer of non-geojson layer type (required, if non-geojson type)', required: false
          parameter :geojson,   'The GeoJSON object with all the specs for the layer', required: false
        end

        let(:layer) { geojson_map_config.layers.first }
        let(:id)    { layer.id }

        context 'when attempting to change to an Esri layer' do
          let(:type) { 'CustomMaps::EsriLayer' }
          let(:layer_url) { 'https://some.domain.com/some_layer' }
          let(:geojson) { layer.geojson }

          example 'Fails to update the map layer type', document: false do
            do_request
            assert_status 200

            updated_layer = CustomMaps::Layer.find(layer.id)
            expect(updated_layer.type).to eq 'CustomMaps::GeojsonLayer'
          end
        end
      end
    end
  end

  context 'when logged in as a project manager' do
    before do
      header_token_for(
        create(:user, roles: [
          { 'type' => 'project_moderator', 'project_id' => geojson_map_project.id },
          { 'type' => 'project_moderator', 'project_id' => esri_map_project.id }
        ])
      )
    end

    include_examples 'successful GET map GeoJSON layers'
    include_examples 'successful GET map Esri layers'
    include_examples 'POST GeoJSON map layer'
    include_examples 'PATCH GeoJSON map layer'
    include_examples 'Reorder GeoJSON map layer'
    include_examples 'POST Esri map layer'
    include_examples 'PATCH Esri map layer'
    include_examples 'DELETE GeoJSON map layer'

    context 'when not manager of the respective project' do
      before do
        header_token_for(create(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => create(:project).id }]))
      end

      include_examples 'unauthorized POST, PATCH and DELETE map layer'
    end
  end

  def encode_json_file_as_base64(filename)
    "data:application/json;base64,#{Base64.encode64(File.read(CustomMaps::Engine.root.join('spec', 'fixtures', filename)))}"
  end
end
