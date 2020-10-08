require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Layers", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  let(:map_config) { create(:map_config, :with_layers) } # map config with 1 layer
  let(:project_id) { map_config.project_id}
  let(:layer) { map_config.layers[0] }
  let(:layer_id) { layer.id }

  get "admin_api/projects/:project_id/map_config/layers" do

    example_request "Get map configuration layers" do
      expect(status).to eq(200)

      json_response = json_parse(response_body)

      expect(json_response.dig(:data).length).to eq(1)
      expect(json_response.dig(:data, 0, :type)).to eq("layer")

      attributes = json_response.dig(:data, 0, :attributes)
      expected_attributes = %i[title_multiloc geojson default_enabled marker_svg_url ordering]
      expect(attributes.keys).to match_array expected_attributes
    end
  end

  delete "admin_api/projects/:project_id/map_config/layers/:layer_id" do
    example_request "Delete map configuration layer" do
      expect(status).to eq(204)
      expect(Maps::Layer.find_by(id: layer_id)).not_to be_present
    end
  end

  post "admin_api/projects/:project_id/map_config/layers" do

    with_options scope: [:data, :attributes], required: true, with_example: true do
      parameter :geojson, "GeoJSON layer specification"
      parameter :default_enabled, "Flag to enable by default"
      parameter :title_multiloc, "The title of the layer (in multiple locales)"
    end

    let(:default_enabled) { true }
    let(:geojson) { layer.geojson }  # reusing the existing geojson for sake of simplicity
    let(:title_multiloc) { {en: "North district", "fr-FR": "Quartier lointain" } }

    example_request "Add a new map layer" do
      expect(status).to eq(200)
      expect(map_config.layers.count).to eq(2)

      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :default_enabled)).to eq(default_enabled)
      expect(json_response.dig(:data, :attributes, :geojson).deep_stringify_keys).to eq(geojson)
      expect(json_response.dig(:data, :attributes, :title_multiloc)).to eq(title_multiloc)
    end

  end

end
