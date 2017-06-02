require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Tenants" do
  before do
    @current_user = create(:user, roles: [{type: 'admin'}])
    token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get "api/v1/tenants/current" do
    example_request "Get the current tenant" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.with_indifferent_access.dig(:data, :attributes, :host)).to eq 'example.org'
    end
  end


  patch "api/v1/tenants/:id" do

    with_options scope: :tenant do   
      parameter :settings, "The changes to the\
      settings object. This will me merged with the existing settings. Arrays\
      will not be merged, but override their values", extra: ""
      parameter :logo, "Base64 encoded logo"
      parameter :header_bg, "Base64 encoded header"
    end

    let(:id) { Tenant.current.id }
    let(:logo) { base64_encoded_image("logo.png")}
    let(:header_bg) { base64_encoded_image("header.jpg")}
    let(:settings) {
      {
        "core" => {
          "organization_name" => {
            "en" => "TestTown",
            "nl" => "TestTowm",
            "fr" => "TestTown"
          }
        }
      }
    }

    example_request "Updating the tenant settings" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:settings,:core,:organization_name,:en)).to eq "TestTown"
    end

    describe do
      let(:settings) {
        {
          "gibberishfeature" => {
            "setting1" => "fake"
          }
        }
      }
      example "Updating the tenant with unsupported features fails", document: false do
        do_request
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors,:settings)).to be_present
      end

    end

    describe do
      let(:settings) {
        {
          "core" => {
            "fakesetting" => "shouldfail"
          }
        }
      }
      example "Updating the tenant with unsupported settings fails", document: false do
        do_request
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors,:settings)).to be_present
      end

    end

  end

    private


  def base64_encoded_image filename
    "data:image/#{filename.split('.').last};base64,#{encode_image_as_base64(filename)}"
  end

  def encode_image_as_base64(filename)
    Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))
  end

end
