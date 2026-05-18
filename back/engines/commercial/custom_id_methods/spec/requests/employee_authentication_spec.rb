# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative 'shared'

describe 'Vienna SAML employee authentication' do
  include_context 'with Vienna SAML authentication enabled', 'vienna_employee'

  include_examples 'authenticates when the user does not exist yet', 'vienna_employee'
  include_examples 'authenticates when the user was already registered with Vienna SAML'

  context 'when the user already exists' do
    before do
      create(:user, email: 'philipp.test@extern.wien.gv.at')
      send_auth_request
    end

    it 'updates the user attributes with the data from the auth response' do
      user = User.find_by(email: 'philipp.test@extern.wien.gv.at')
      expect(user).to have_attributes(first_name: 'Philipp', last_name: 'Preß')
    end

    it 'sets the JWT auth token and redirects to home page' do
      expect(cookies[:cl2_jwt]).to be_present
      expect(response).to redirect_to('/en/?sso_flow=signin&sso_success=true')
    end
  end
end
