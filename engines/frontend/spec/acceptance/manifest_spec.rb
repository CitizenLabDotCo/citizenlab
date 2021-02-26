require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Manifest" do
 
  explanation "Small endpoint that generates Web App Manifest. See https://developers.google.com/web/fundamentals/web-app-manifest/"

  before do
    header "Content-Type", "application/json"
  end

  get "web_api/v1/manifest.json" do

    example_request "Get the manifest" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response).to match({
        :short_name=>"Liege",
        :icons=>[{:src=>nil, :type=>"image/png", :sizes=>"152x152"}],
        :start_url=>"http://example.org/?utm_source=manifest",
        :background_color=>"#FFFFFF",
        :display=>"standalone",
        :theme_color=>"#335533"
      })
    end
  end

end
