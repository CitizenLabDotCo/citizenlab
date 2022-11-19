# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users - Locked attributes' do
  explanation "List the attributes the user can't change in their profile, since they're controlled by a verification method"

  before do
    header 'Content-Type', 'application/json'
    @user = create(:user)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
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
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].map { |d| d[:attributes][:name] }).to eq %w[first_name last_name]
      end
    end

    context 'for an unauthenticated user' do
      before do
        header 'Authorization', nil
      end

      example_request '[error] returns 401 Unauthorized response' do
        expect(status).to eq(401)
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
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:ui_schema_multiloc, :en, :elements).find { |e| e[:scope] == '#/properties/gender' }[:options].to_h).to include({
        readonly: true,
        verificationLocked: true
      })
    end
  end
end
