require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "GeotagIdeas" do

  explanation "Returns ideas with their locations, geotagged if not specified by the author"

  before do
    header "Content-Type", "application/json"
    @user = create(:admin)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get "/web_api/v1/ideas/geotagged" do
    before do
      @ideas = create_list(:idea, 2, title_multiloc: {'nl-BE' => 'Een fietspad in het Prinsenbos van Grimbergen'})
    end

    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of campaigns per page"
    end

    describe '' do

      example "List all ideas geotagged" do
        allow_any_instance_of(NLP::GeotagService).to receive(:geotag).and_return({
          'lat' => 50.9290945, 
          'lon' => 4.37096336520241, 
          'address' => 'Prinsenbos'
        })
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end
  end
end