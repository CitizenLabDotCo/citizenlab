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
end
