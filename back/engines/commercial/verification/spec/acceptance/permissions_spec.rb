# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users - Locked attributes' do
  explanation "List the attributes the user can't change in their profile, since they're controlled by a verification method"

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    header_token_for @user
  end

  get 'web_api/v1/users/me/locked_attributes' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of verification methods per page'
    end

    before do
      create(:verification, method_name: 'clave_unica', user: @user)
    end

    context 'for an authenticated user' do
      example_request 'List locked built-in attributes' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].map { |d| d[:attributes][:name] }).to eq %w[first_name last_name]
      end
    end

    context 'for an unauthenticated user' do
      before do
        header 'Authorization', nil
      end

      example_request '[error] returns 401 Unauthorized response' do
        assert_status 401
      end
    end
  end

  get 'web_api/v1/users/custom_fields/json_forms_schema', document: false do
    before do
      # Bogus locks the `gender` custom_field
      create(:custom_field_gender)
      create(:verification, method_name: 'bogus', user: @user)
    end

    example_request 'Jsonforms UI schema marks the locked fields' do
      assert_status 200
      json_response = json_parse response_body
      binding.pry

      expect(json_response.dig(:data, :type)).to eq 'json_forms_schema'
      expect(json_response.dig(:data, :attributes, :ui_schema_multiloc, :en, :elements).find { |e| e[:scope] == '#/properties/gender' }[:options].to_h).to include({
        readonly: true,
        verificationLocked: true
      })
    end
  end

  get 'web_api/v1/permissions/visiting/schema', document: false do
    before do
      # Bogus locks the `gender` custom_field
      create(:custom_field_gender)
      create(:verification, method_name: 'bogus', user: @user)
      Permissions::PermissionsUpdateService.new.update_all_permissions
    end

    example_request 'Jsonforms UI schema marks the locked fields' do
      assert_status 200
      expect(response_data[:type]).to eq 'schema'
      expect(response_data.dig(:attributes, :ui_schema_multiloc, :en, :elements).find { |e| e[:scope] == '#/properties/gender' }[:options].to_h).to include({
         readonly: true,
         verificationLocked: true
                                                                                                                                                                   })
    end
  end

end
