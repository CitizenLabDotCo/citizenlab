# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'Vienna SAML citizen authentication' do
  def enable_vienna_citizen_login
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['vienna_citizen_login'] = {
      allowed: true,
      enabled: true,
      environment: 'test'
    }
    configuration.save!
  end

  def send_auth_request
    @uid = "_#{SecureRandom.hex}" # uid is unique per request, not per user
    saml_auth_response.uid = @uid # make sure it's overwritten even if saml_auth_response is cached
    get '/auth/vienna_citizen'
    follow_redirect!
  end

  let(:user) { create(:user) }
  let(:saml_auth_response) do
    OmniAuth::AuthHash.new(
      {
        'provider' => 'vienna_citizen',
        'uid' => @uid,
        'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
        'credentials' => {},
        'extra' =>
        { 'raw_info' =>
         { 'urn:oid:1.2.40.0.10.2.1.1.71' => ['AT:VKZ:L9'],
           'http://lfrz.at/stdportal/names/pvp2/txid' => ['101840$tkhx@7009p1'],
           'urn:oid:2.5.4.11' => ['MA 01'],
           'urn:oid:1.2.40.0.10.2.1.1.261.20' => ['Preß'],
           'urn:oid:0.9.2342.19200300.100.1.3' => ['philipp.test@extern.wien.gv.at'],
           'urn:oid:1.2.40.0.10.2.1.1.261.10' => ['2.1'],
           'urn:oid:1.2.40.0.10.2.1.1.153' => ['L9-M01'],
           'urn:oid:0.9.2342.19200300.100.1.1' => ['wien1.prp9002@wien.gv.at'],
           'urn:oid:1.2.40.0.10.2.1.1.261.30' => ['access()'],
           'urn:oid:1.2.40.0.10.2.1.1.261.24' => ['L9'],
           'urn:oid:1.2.40.0.10.2.1.1.261.110' => ['1'],
           'urn:oid:2.5.4.42' => ['Philipp'],
           'urn:oid:1.2.40.0.10.2.1.1.3' => ['AT:VKZ:L9-M01'],
           'urn:oid:1.2.40.0.10.2.1.1.1' => ['AT:L9:1:magwien.gv.at/prp9002'],
           'http://lfrz.at/stdportal/names/pvp/gvoudomain' => ['magwien.gv.at'],
           'fingerprint' => '09:ED:23:7D:BC:95:A7:37:15:F6:76:4B:0A:AF:D5:CB:36:0D:47:14' },
          'session_index' => '_45ff99f6f7b2bc6553cd9a7868b96e33',
          'response_object' => OneLogin::RubySaml::Response.new('fakeresponse') }
      }
    )
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:vienna_citizen] = saml_auth_response
    enable_vienna_citizen_login
  end

  context 'when the user does not exist yet' do
    before do
      send_auth_request
    end

    it 'redirects to complete signup path' do
      expect(response).to redirect_to('/en/complete-signup?')
    end

    it 'creates the user and identity' do
      user = User.find_by(email: 'philipp.test@extern.wien.gv.at', first_name: 'Philipp', last_name: 'Preß')
      expect(user).to be_present
      expect(user.identities.first).to have_attributes(provider: 'vienna_citizen', uid: 'wien1.prp9002@wien.gv.at')
    end

    it 'sets the JWT auth token' do
      expect(cookies[:cl2_jwt]).to be_present
    end
  end

  context 'when the user already exists' do
    before do
      create(:user, email: 'philipp.test@extern.wien.gv.at', first_name: 'Bob', last_name: 'Alice')
      send_auth_request
    end

    it 'does not overwrite first name & last name with the data from the auth response' do
      user = User.find_by(email: 'philipp.test@extern.wien.gv.at')
      expect(user).to have_attributes(first_name: 'Bob', last_name: 'Alice')
    end

    it 'sets the JWT auth token' do
      expect(cookies[:cl2_jwt]).to be_present
    end

    it 'redirects to home page' do
      expect(response).to redirect_to('/en?')
    end
  end

  context 'when the user was already registered with Vienna SAML' do
    before do
      send_auth_request
    end

    it 'does not create second identity' do
      expect do
        send_auth_request
      end.not_to change(Identity, :count)
    end

    context 'when the user changed their email address' do
      before do
        saml_auth_response.extra.raw_info['urn:oid:0.9.2342.19200300.100.1.3'] = ['alex@citizenlab.co']
      end

      it 'does not create another identity and user account' do
        expect do
          send_auth_request
        end.not_to change { [Identity.count, User.count] }
      end
    end
  end

  context 'when the SAML response does not include first name and last name' do
    before do
      saml_auth_response.extra.raw_info.delete('urn:oid:1.2.40.0.10.2.1.1.261.20')
      saml_auth_response.extra.raw_info.delete('urn:oid:2.5.4.42')
      send_auth_request
    end

    it 'creates the user and identity with initials based on the email' do
      user = User.find_by(email: 'philipp.test@extern.wien.gv.at', first_name: 'P', last_name: 'T')
      expect(user).to be_present
      expect(user.identities.first).to have_attributes(provider: 'vienna_citizen', uid: 'wien1.prp9002@wien.gv.at')
    end
  end
end
