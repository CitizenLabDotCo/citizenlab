require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Verification methods" do
 
  explanation "Verification methods are the channels that lets users prove they're real. (e.g. itsme)"

  before do
    header "Content-Type", "application/json"
    @tenant = Tenant.current
    settings = @tenant.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{name: 'cow'}],
    }
    @tenant.save!
  end

  get "web_api/v1/verification_methods" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of verification methods per page"
    end

    example_request "Lists all active verification methods" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data]).to eq([
        {:id=>"7ccd453d-0eaf-412a-94a2-ae703b1b3e3f", :type=>"verification_method", :attributes=>{:name=>"cow"}},
      ])
    end
  end

end
