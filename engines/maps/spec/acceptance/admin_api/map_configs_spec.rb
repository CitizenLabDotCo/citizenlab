require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "MapConfigs", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  let(:map_config) { create(
      :map_config,
      :with_layers,
      :with_positioning,
      :with_tile_provider
  ) }
  let(:project_id) { map_config.project_id }

  let(:zoom_level) { 17.2 }
  let(:tile_provider) { 'https://my-tile-provider.com/{x}/{y}/{z}'}
  let(:longitude) { 52.52 }
  let(:latitude) { 13.4 }
  let(:center) { {type: "Point", coordinates: [longitude, latitude]} }

  get "admin_api/projects/:project_id/map_config" do
    example_request "Get project map configuration" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)

      expect(json_response[:data][:id]).to eq(map_config.id)

      attributes = json_response[:data][:attributes]
      expect(attributes[:tile_provider]).to eq( map_config.tile_provider)
      expect(attributes[:zoom_level].to_f).to eq(map_config.zoom_level)
    end

  end

  delete "admin_api/projects/:project_id/map_config" do

    let(:map_config_id) { map_config.id }

    example_request "Delete project map configuration" do
      expect(status).to eq(204)
      config = Maps::MapConfig.find_by(project_id: project_id)
      expect(config).to be_nil
    end

  end

  patch "admin_api/projects/:project_id/map_config" do

    with_options scope: [:data, :attributes], required: false, with_example: true do
      parameter :zoom_level, "The zoom level of the map"
      parameter :center, "The coordinates of the map center as a GeoJSON object"
      parameter :tile_provider, "The tile provider"
    end

    example_request "Update a map configuration" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:zoom_level).to_f).to eq(zoom_level)
      expect(json_response.dig(:data,:attributes,:tile_provider)).to eq(tile_provider)
      expect(json_response.dig(:data,:attributes,:center, :coordinates)[0]).to eq(longitude)
      expect(json_response.dig(:data,:attributes,:center, :coordinates)[1]).to eq(latitude)
    end

  end

  put "admin_api/projects/:project_id/map_config" do

    with_options scope: [:data, :attributes], required: true, with_example: true do
      parameter :zoom_level, "The zoom level of the map"
      parameter :center, "The coordinates of the map center as a GeoJSON object"
      parameter :tile_provider, "The tile provider"
    end

    let(:project) { create(:project) }
    let(:project_id) { project.id }

    example_request "Create a map configuration" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)

      expect(json_response.dig(:data,:attributes, :project_id)).to eq(project_id)
      expect(json_response.dig(:data,:attributes,:zoom_level).to_f).to eq(zoom_level)
      expect(json_response.dig(:data,:attributes,:tile_provider)).to eq(tile_provider)
      expect(json_response.dig(:data,:attributes,:center, :coordinates)[0]).to eq(longitude)
      expect(json_response.dig(:data,:attributes,:center, :coordinates)[1]).to eq(latitude)
    end
  end
end
