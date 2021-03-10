# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Map Layers' do
  explanation 'Map layers are visual blocks that can be displayed on top of maps, like markers, polygons or lines.'

  let!(:project)      { create(:project) }
  let!(:map_config)   do
    create(:map_config,
           :with_positioning,
           :with_tile_provider,
           :with_layers,
           :with_legend,
           project: project)
  end

  let(:project_id)    { project.id }
  let(:json_response) { JSON.parse(response_body, symbolize_names: false) }
  let(:attributes)    { json_response.dig('data', 'attributes').with_indifferent_access }

  before do
    header 'Content-Type', 'application/json'
  end

  shared_examples 'successful GET map layers' do
    get 'web_api/v1/projects/:project_id/map_config/layers/:id' do
      let(:layer) { map_config.layers.first }
      let(:id)    { layer.id }

      example_request 'Get a map layer of a project' do
        expect(status).to eq 200
        expect(attributes['title_multiloc']).to   eq layer.title_multiloc
        expect(attributes['geojson']).to          eq layer.geojson
        expect(attributes['default_enabled']).to  eq layer.default_enabled
        expect(attributes['marker_svg_url']).to   eq layer.marker_svg_url
        expect(attributes['ordering']).to         eq layer.ordering
      end
    end
  end

  context 'when not logged in' do
    include_examples 'successful GET map layers'
  end

  context 'when logged in as a normal user' do
    before do
      user_header_token
    end

    include_examples 'successful GET map layers'
  end

  context 'when logged in as an admin' do
    before do
      admin_header_token
    end

    include_examples 'successful GET map layers'
  end

  def encode_json_file_as_base64(filename)
    "data:application/json;base64,#{Base64.encode64(File.read(Maps::Engine.root.join('spec', 'fixtures', filename)))}"
  end
end
