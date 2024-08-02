# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Permissions custom field schema - Locked attributes' do
  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
  end

  get 'web_api/v1/permissions/visiting/schema', document: false do
    before do
      # Bogus locks the `gender` custom_field
      create(:custom_field_gender)
      create(:verification, method_name: 'bogus', user: @user)
      Permissions::PermissionsUpdateService.new.update_all_permissions
    end

    example_request 'Locked fields are marked in the UI schema' do
      assert_status 200
      expect(response_data[:type]).to eq 'schema'
      expect(response_data.dig(:attributes, :ui_schema_multiloc, :en, :elements).find { |e| e[:scope] == '#/properties/gender' }[:options].to_h).to include({
        readonly: true,
        verificationLocked: true
      })
    end
  end
end
