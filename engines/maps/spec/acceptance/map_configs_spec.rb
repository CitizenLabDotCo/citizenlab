require "rails_helper"
require "rspec_api_documentation/dsl"

resource "Map configs" do

  explanation "A map config defines how a project map should be positioned and which layers it should display"

  before do
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get 'web_api/v1/projects/:project_id/map_config' do
    let(:project) { create(:project) }
    let(:project_id) { project.id }

    describe do
      let!(:map_config) { create(:map_config,
        :with_positioning,
        :with_tile_provider,
        :with_layers,
        :with_legend,
        project: project
      ) }

      example_request "Get the map config of a project" do
        expect(status).to eq 200
        json_response = JSON.parse(response_body, symbolize_names: false)
        expect(json_response["data"]["attributes"]["center_geojson"]).to eq({
          "coordinates" => [4.3517, 50.8503],
          "type" => "Point"
        })
        expect(json_response["data"]["attributes"]["tile_provider"]).to eq map_config.tile_provider
        expect(json_response["data"]["attributes"]["zoom_level"]).to eq map_config.zoom_level.to_s
        expect(json_response["data"]["attributes"]["layers"][0]["title_multiloc"]).to eq map_config.layers.first.title_multiloc
        expect(json_response["data"]["attributes"]["layers"][0]["geojson"]).to eq map_config.layers.first.geojson
        expect(json_response["data"]["attributes"]["layers"][0]["default_enabled"]).to eq map_config.layers.first.default_enabled
        expect(json_response["data"]["attributes"]["layers"][0]["marker_svg_url"]).to eq map_config.layers.first.marker_svg_url
        expect(json_response["data"]["attributes"]["legend"][0]["title_multiloc"]).to eq map_config.legend_items.first.title_multiloc
        expect(json_response["data"]["attributes"]["legend"][0]["color"]).to eq map_config.legend_items.first.color
      end
    end

    describe do
      let!(:map_config) { create(:map_config) }

      example_request "[error] Get the map config of a project that doesn't have one" do
        expect(status).to eq 404
      end
    end
  end
end