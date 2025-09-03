# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

require_relative 'shared'

describe 'Vienna SAML citizen authentication' do
  include_context 'with Vienna SAML authentication enabled', 'vienna_citizen'

  include_examples 'authenticates when the user does not exist yet', 'vienna_citizen'
  include_examples 'authenticates when the user was already registered with Vienna SAML'

  context 'when the user already exists' do
    before do
      create(:user, email: 'philipp.test@extern.wien.gv.at', first_name: 'Bob', last_name: 'Alice')
    end

    it 'does not overwrite first name & last name with the data from the auth response' do
      send_auth_request
      user = User.find_by(email: 'philipp.test@extern.wien.gv.at')
      expect(user).to have_attributes(first_name: 'Bob', last_name: 'Alice')
    end

    context 'when the SAML response does not include first name and last name' do
      before do
        delete_raw_info_attribute('urn:oid:1.2.40.0.10.2.1.1.261.20')
        delete_raw_info_attribute('urn:oid:2.5.4.42')
      end

      it 'does not overwrite first name & last name with empty data from the auth response' do
        send_auth_request
        user = User.find_by(email: 'philipp.test@extern.wien.gv.at')
        expect(user).to have_attributes(first_name: 'Bob', last_name: 'Alice')
      end
    end

    it 'sets the JWT auth token and redirects to home page' do
      send_auth_request
      expect(cookies[:cl2_jwt]).to be_present
      expect(response).to redirect_to('/en/?sso_flow=signin&sso_success=true')
    end
  end

  context 'when the SAML response does not include first name and last name' do
    before do
      delete_raw_info_attribute('urn:oid:1.2.40.0.10.2.1.1.261.20')
      delete_raw_info_attribute('urn:oid:2.5.4.42')
      send_auth_request
    end

    it 'creates the user and identity with initials based on the email' do
      user = User.find_by(email: 'philipp.test@extern.wien.gv.at', first_name: 'P', last_name: 'T')
      expect(user).to be_present
      expect(user.identities.first).to have_attributes(provider: 'vienna_citizen', uid: 'wien1.prp9002@wien.gv.at')
    end
  end
end
