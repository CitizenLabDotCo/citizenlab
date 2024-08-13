# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Permissions user custom field schemas - Locked attributes' do
  get 'web_api/v1/permissions/visiting/schema', document: false do
    before do
      create(:custom_field_gender, required: false)
      Permissions::PermissionsUpdateService.new.update_all_permissions

      user = create(:user)
      create(:verification, method_name: 'bogus', user: user) # Bogus locks the `gender` custom_field

      header 'Content-Type', 'application/json'
      header_token_for user
    end

    example_request 'Locked fields are marked in the UI schema' do
      assert_status 200
      expect(response_data[:type]).to eq 'schema'
      expect(response_data.dig(:attributes, :json_schema_multiloc, :en, :required)).to eq ['gender']
      expect(response_data.dig(:attributes, :ui_schema_multiloc, :en, :elements).find { |e| e[:scope] == '#/properties/gender' }[:options].to_h).to include({
        readonly: true,
        verificationLocked: true
      })
    end
  end
end
