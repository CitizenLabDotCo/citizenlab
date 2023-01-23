# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AppConfigurations' do
  explanation 'AppConfigurations store the global settings of the application.'

  before do
    @current_user = create(:user, roles: [{ type: 'admin' }])
    token = Knock::AuthToken.new(payload: @current_user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/app_configuration' do
    AppConfiguration::Settings.json_schema['properties'].each do |feature, feature_descriptor|
      parameter :allowed, "Does the commercial plan allow #{feature}", scope: [:app_configuration, :settings, feature]
      parameter :enabled, "Is #{feature} enabled", scope: ['settings', feature]

      feature_descriptor['properties'].without('allowed', 'enabled').each do |setting, setting_descriptor|
        field_description = "#{setting_descriptor['description']}. Type: #{setting_descriptor['type']}"
        response_field setting, field_description, scope: [:settings, feature]
      end
    end

    example_request 'Get the current configuration' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.with_indifferent_access.dig(:data, :attributes, :host)).to eq 'example.org'
    end
  end

  patch 'web_api/v1/app_configuration' do
    with_options scope: :app_configuration do
      parameter :logo, 'Base64 encoded logo'
      parameter :favicon, 'Base64 encoded favicon'

      # Settings parameters
      parameter :settings, <<~DESC, extra: ''
        The changes to the settings object. This will be merged with the 
        existing settings. Arrays will not be merged, but override their 
        values.
      DESC

      AppConfiguration::Settings.json_schema['properties'].each do |feature, feature_descriptor|
        parameter :allowed, "Does the commercial plan allow #{feature}", scope: [:app_configuration, :settings, feature]
        parameter :enabled, "Is #{feature} enabled", scope: [:app_configuration, :settings, feature]
        feature_descriptor['properties'].without('allowed', 'enabled').each do |setting, setting_descriptor|
          parameter_description = "#{setting_descriptor['description']}. Type: #{setting_descriptor['type']}"
          parameter setting, parameter_description, scope: [:app_configuration, :settings, feature]
        end
      end
    end

    ValidationErrorHelper.new.error_fields(self, AppConfiguration)

    let(:logo) { png_image_as_base64 'logo.png' }
    let(:favicon) { png_image_as_base64 'favicon.png' }
    let(:organization_name) do
      {
        'en' => 'TestTown',
        'nl-BE' => 'TestTowm',
        'fr-FR' => 'TestTown'
      }
    end

    example_request 'Update the app configuration' do
      assert_status 200

      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :settings, :core, :organization_name, :en)).to eq 'TestTown'
      expect(json_response.dig(:data, :attributes, :favicon)).to be_present
    end

    describe do
      let(:settings) do
        { gibberish_feature: { setting1: 'fake' } }.deep_stringify_keys!
      end

      example '[error] Updating the configuration with unsupported features fails', document: false do
        do_request
        assert_status 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :settings)).to be_present
      end
    end

    describe do
      let(:settings) do
        { core: { fake_setting: 'should_fail' } }.deep_stringify_keys!
      end

      example '[error] Updating the configuration with unsupported settings fails', document: false do
        do_request
        assert_status 422
        json_response = json_parse(response_body)
        expect(json_response.dig(:errors, :settings)).to be_present
      end
    end

    describe do
      example 'The logo can be removed' do
        configuration = AppConfiguration.instance
        configuration.update(logo: Rails.root.join('spec/fixtures/logo.png').open)
        expect(configuration.reload.logo_url).to be_present
        do_request app_configuration: { logo: nil }
        expect(configuration.reload.logo_url).to be_nil
      end
    end

    describe do
      example 'The favicon can be removed' do
        configuration = AppConfiguration.instance
        configuration.update(favicon: Rails.root.join('spec/fixtures/favicon.png').open)
        expect(configuration.reload.favicon_url).to be_present
        do_request app_configuration: { favicon: nil }
        expect(configuration.reload.favicon_url).to be_nil
      end
    end
  end
end
