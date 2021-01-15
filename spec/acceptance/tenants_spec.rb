require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Tenants" do

  explanation "Tenants represent the different platforms (typically one for each city)."

  before do
    @current_user = create(:user, roles: [{type: 'admin'}])
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
  end

  get "web_api/v1/tenants/current" do
    with_options scope: :style do
      Tenant.available_style_attributes.each do |attr|
        response_field attr[:name], attr[:description]
      end
    end
    Tenant.settings_json_schema["properties"].each do |feature, feature_descriptor|
      parameter :allowed, "Does the commercial plan allow #{feature}", scope: [:tenant, :settings, feature]
      parameter :enabled, "Is #{feature} enabled", scope: ['settings', feature]
      feature_descriptor["properties"].each do |setting, setting_descriptor|
        unless ["enabled", "allowed"].include?(setting)
          response_field setting, "#{setting_descriptor["description"]}. Type: #{setting_descriptor["type"]}", scope: [:settings, feature]
        end
      end
    end

    example_request "Get the current tenant" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.with_indifferent_access.dig(:data, :attributes, :host)).to eq 'example.org'
      expect(json_response.with_indifferent_access.dig(:data, :attributes, :style)).to eq({})
    end
    example "[Error] Get the current tenant if it doesn't exist" do
      Tenant.current.update!(host: 'changedhost.com')
      do_request
      expect(response_status).to eq 404
      # json_response = json_parse(response_body)

    end
  end

  patch "web_api/v1/tenants/:id" do
    with_options scope: :tenant do
      parameter :logo, "Base64 encoded logo"
      parameter :header_bg, "Base64 encoded header"
      parameter :favicon, "Base64 encoded favicon"
      parameter :settings, "The changes to the\
      settings object. This will me merged with the existing settings. Arrays\
      will not be merged, but override their values.", extra: ""
      parameter :style, "The changes to the\
      style object. This will me merged with the existing style. Arrays\
      will not be merged, but override their values.", extra: ""

      Tenant.settings_json_schema["properties"].each do |feature, feature_descriptor|
        parameter :allowed, "Does the commercial plan allow #{feature}", scope: [:tenant, :settings, feature]
        parameter :enabled, "Is #{feature} enabled", scope: [:tenant, :settings, feature]
        feature_descriptor['properties'].each do |setting, setting_descriptor|
          next if %w[enabled allowed].include?(setting)

          parameter setting, "#{setting_descriptor['description']}. Type: #{setting_descriptor['type']}", scope: [:tenant, :settings, feature]
        end
      end
      Tenant.style_json_schema["properties"].each do |style, style_descriptor|
        parameter style, "#{style_descriptor["description"]}. Type: #{style_descriptor["type"]}", scope: [:tenant, :style]
      end
    end
    ValidationErrorHelper.new.error_fields(self, Tenant)

    let(:id) { Tenant.current.id }
    let(:logo) { base64_encoded_image("logo.png", "image/png") }
    let(:header_bg) { base64_encoded_image("header.jpg", "image/jpeg") }
    let(:favicon) { base64_encoded_image("favicon.png", "image/png") }
    let(:organization_name) do
      {
        'en' => 'TestTown',
        'nl-BE' => 'TestTowm',
        'fr-FR' => 'TestTown'
      }
    end
    let(:style) {
      {
        "signedOutHeaderOverlayColor" => "#3467eb",
        "signedInHeaderOverlayColor" => "#db2577",
      }
    }

    example_request "Update the tenant settings" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:settings,:core,:organization_name,:en)).to eq "TestTown"
      expect(json_response.dig(:data,:attributes,:favicon)).to be_present
      expect(json_response.dig(:data,:attributes,:style,:signedOutHeaderOverlayColor)).to eq "#3467eb"
      expect(json_response.dig(:data,:attributes,:style,:signedInHeaderOverlayColor)).to eq "#db2577"
    end

    describe do
      let(:settings) {
        {
          "gibberishfeature" => {
            "setting1" => "fake"
          }
        }
      }

      example "[error] Updating the tenant with unsupported features fails", document: false do
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

      example "[error] Updating the tenant with unsupported settings fails", document: false do
        do_request
        expect(response_status).to eq 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors,:settings)).to be_present
      end
    end

    describe do
      example "The header image can be removed" do
        tenant = Tenant.current
        tenant.update(header_bg: Rails.root.join("spec/fixtures/header.jpg").open)
        expect(tenant.reload.header_bg_url).to be_present
        do_request tenant: {header_bg: nil}
        expect(tenant.reload.header_bg_url).to be nil
      end
    end

    describe do
      example "The logo can be removed" do
        tenant = Tenant.current
        tenant.update(logo: Rails.root.join("spec/fixtures/logo.png").open)
        expect(tenant.reload.logo_url).to be_present
        do_request tenant: {logo: nil}
        expect(tenant.reload.logo_url).to be nil
      end
    end

    describe do
      example "The favicon can be removed" do
        tenant = Tenant.current
        tenant.update(favicon: Rails.root.join("spec/fixtures/favicon.png").open)
        expect(tenant.reload.favicon_url).to be_present
        do_request tenant: {favicon: nil}
        expect(tenant.reload.favicon_url).to be nil
      end
    end
  end


  private

  def base64_encoded_image filename, mime
    "data:#{mime};base64,#{encode_image_as_base64(filename)}"
  end

  def encode_image_as_base64(filename)
    Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))
  end

end
