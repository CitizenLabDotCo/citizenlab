# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'User Custom Fields - Locked Fields' do
  explanation 'Test locked custom fields constraints in user custom fields API'

  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature! 'verification', settings: { 
      verification_methods: [{ name: 'bogus', enabled_for_verified_actions: true }] 
    }
  end

  let(:user) { create(:user) }
  let!(:gender_field) { create(:custom_field_gender, required: false) }

  context 'when user has locked custom fields from verification' do
    before do
      create(:verification, method_name: 'bogus', user: user)
      header_token_for user
    end

    get 'web_api/v1/users/custom_fields' do
      example_request 'List user custom fields with locked constraints' do
        assert_status 200
        json_response = json_parse response_body
        
        gender_custom_field = json_response[:data].find { |field| field[:attributes][:code] == 'gender' }
        expect(gender_custom_field).not_to be_nil, "Gender custom field not found in response. Available fields: #{json_response[:data].map { |f| f[:attributes][:code] }}"
        expect(gender_custom_field[:attributes][:constraints]).to eq({ locked: true })
      end
    end
  end

  context 'when user has no locked custom fields' do
    before do
      header_token_for user
    end

    get 'web_api/v1/users/custom_fields' do
      example_request 'List user custom fields without locked constraints' do
        assert_status 200
        json_response = json_parse response_body
        
        gender_custom_field = json_response[:data].find { |field| field[:attributes][:code] == 'gender' }
        expect(gender_custom_field).not_to be_nil, "Gender custom field not found in response. Available fields: #{json_response[:data].map { |f| f[:attributes][:code] }}"
        expect(gender_custom_field[:attributes][:constraints]).to eq({})
      end
    end
  end
end