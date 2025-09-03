# frozen_string_literal: true

require 'rails_helper'

RSpec.shared_context 'with Vienna SAML authentication enabled' do |provider_name|
  define_method :send_auth_request do
    @uid = "_#{SecureRandom.hex}" # uid is unique per request, not per user
    saml_auth_response.uid = @uid # make sure it's overwritten even if saml_auth_response is cached
    get "/auth/#{provider_name}"
    follow_redirect!
  end

  def set_raw_info_attribute(attribute_name, value)
    saml_auth_response.extra.raw_info[attribute_name] = Array.wrap(value)
  end

  def delete_raw_info_attribute(attribute_name)
    info = saml_auth_response.extra.raw_info
    new_raw_info = OneLogin::RubySaml::Attributes.new(info.reject { |attr, _value| attr == attribute_name })
    saml_auth_response.extra.raw_info = new_raw_info
  end

  let(:saml_auth_response) do
    OmniAuth::AuthHash.new(
      {
        'provider' => provider_name,
        'uid' => @uid,
        'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
        'credentials' => {},
        'extra' => {
          'raw_info' => OneLogin::RubySaml::Attributes.new({
            'urn:oid:1.2.40.0.10.2.1.1.71' => ['AT:VKZ:L9'],
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
            'fingerprint' => '09:ED:23:7D:BC:95:A7:37:15:F6:76:4B:0A:AF:D5:CB:36:0D:47:14'
          }),
          'session_index' => '_45ff99f6f7b2bc6553cd9a7868b96e33',
          'response_object' => OneLogin::RubySaml::Response.new('fakeresponse')
        }
      }
    )
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[provider_name.to_sym] = saml_auth_response

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings["#{provider_name}_login"] = {
      allowed: true,
      enabled: true,
      environment: 'test'
    }
    configuration.save!
  end
end

RSpec.shared_examples 'authenticates when the user does not exist yet' do |provider_name|
  context 'when the user does not exist yet' do
    before do
      send_auth_request
    end

    it 'creates the user and identity' do
      user = User.find_by(email: 'philipp.test@extern.wien.gv.at', first_name: 'Philipp', last_name: 'Preß')
      expect(user).to be_present
      expect(user.identities.first).to have_attributes(provider: provider_name, uid: 'wien1.prp9002@wien.gv.at')
    end

    it 'sets the JWT auth token and redirects to complete signup path' do
      expect(cookies[:cl2_jwt]).to be_present
      expect(response).to redirect_to('/en/?sso_flow=signup&sso_success=true')
    end
  end
end

RSpec.shared_examples 'authenticates when the user was already registered with Vienna SAML' do
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
        set_raw_info_attribute('urn:oid:0.9.2342.19200300.100.1.3', 'test393@citizenlab.co')
      end

      it 'does not create another identity and user account' do
        expect do
          send_auth_request
        end.not_to change { [Identity.count, User.count] }
        expect(User.count).to eq(1)
      end

      context 'when password login is disabled' do
        before do
          configuration = AppConfiguration.instance
          configuration.settings['password_login'] = { allowed: true, enabled: false }
          configuration.save!
        end

        it "updates user's email" do
          expect do
            send_auth_request
          end.to(change { User.first.email }.from('philipp.test@extern.wien.gv.at').to('test393@citizenlab.co'))
        end

        context 'when email confirmation is enabled' do
          before do
            configuration = AppConfiguration.instance
            configuration.settings['user_confirmation'] = { allowed: true, enabled: true }
            configuration.save!
          end

          it "updates user's email" do
            expect do
              send_auth_request
            end.to(change { User.first.email }.from('philipp.test@extern.wien.gv.at').to('test393@citizenlab.co'))
          end
        end
      end

      context 'when password login is enabled' do
        before do
          configuration = AppConfiguration.instance
          configuration.settings['password_login'] = {
            allowed: true,
            enabled: true,
            minimum_length: 8,
            enable_signup: true
          }
          configuration.save!
        end

        it "doesn't update user's email" do
          expect do
            send_auth_request
          end.not_to(change { User.first.email })
          expect(User.first.email).to eq('philipp.test@extern.wien.gv.at')
        end
      end
    end
  end
end
