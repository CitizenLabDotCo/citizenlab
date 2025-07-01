# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe IdRmUnify::RmUnifyOmniauth do
  let(:user) { create(:user, first_name: 'Bill', last_name: 'Scott') }
  let(:token) { AuthToken::AuthToken.new(payload: user.to_token_payload).token }
  let(:saml_auth_response) do
    OmniAuth::AuthHash.new(
      { 'provider' => 'rm_unify',
        'uid' => 'WzQ4E10d2etzDpimCInoc+zkN5M=',
        'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
        'credentials' => {},
        'extra' =>
         { 'raw_info' =>
            OneLogin::RubySaml::Attributes.new(
              { 'urn:oid:2.5.4.42' => ['Jane'],
                'urn:oid:2.5.4.4' => ['McDonald'],
                'urn:oid:1.3.6.1.4.1.5923.1.1.1.10' => ['http://sts.platform.rmunify.com/sts/WzQ4E10d2etzDpimCInoc+zkN5M='],
                'fingerprint' => '54:D0:80:0C:53:FC:EB:D2:70:63:5D:74:5F:59:1C:A3:AD:82:5C:F9' }
            ) } }
    )
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:rm_unify] = saml_auth_response
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'rm_unify'
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  it 'successfully verifies a user' do
    get "/auth/rm_unify?token=#{token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')

    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Bill',
      last_name: 'Scott'
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'rm_unify',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, saml_auth_response[:uid], 'rm_unify')
    })
  end

  it "successfully verifies a user that hasn't completed her registration" do
    user.update!(registration_completed_at: nil)

    get "/auth/rm_unify?token=#{token}&verification_pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?verification_success=true')
    expect(user.reload).to have_attributes({
      verified: true
    })
  end

  it 'redirect to a path without an ending slash when no pathname is passed' do
    get "/auth/rm_unify?token=#{token}"
    follow_redirect!
    expect(response).to redirect_to('/en?verification_success=true')
  end

  it 'fails when the returned uid has already been used' do
    create(
      :verification,
      method_name: 'rm_unify',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, saml_auth_response[:uid], 'rm_unify')
    )

    get "/auth/rm_unify?token=#{token}&verification_pathname=/some-page"
    follow_redirect!

    expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
    expect(user.reload).to have_attributes({
      verified: false,
      first_name: 'Bill',
      last_name: 'Scott'
    })
  end

  context 'verifying and creating a new user' do
    let(:user) { nil }

    it 'creates a user with a unique ID and no email, then logs them in' do
      get '/auth/rm_unify?sso_pathname=/en/whatever-page&other_param=123'
      follow_redirect!

      expect(response).to redirect_to('/en/whatever-page?other_param=123&sso_flow=signup&sso_success=true')
      expect(cookies[:cl2_jwt]).to be_present
      jwt_payload = JWT.decode(cookies[:cl2_jwt], nil, false).first
      expect(User.first.id).to eq jwt_payload['sub']
      expect(User.first.email).to be_nil
      expect(User.first.email_confirmed_at).to be_nil
      expect(User.first.first_name).to eq('Jane')
      expect(User.first.last_name).to eq('McDonald')
      expect(User.first.verified).to be(true)
      expect(User.first.unique_code).to eq('WzQ4E10d2etzDpimCInoc+zkN5M=')
    end
  end

  context 'verifying and logging in a user' do
    let!(:user) { create(:user, first_name: 'Bob', last_name: 'Jelly', email: nil, unique_code: '9208-2002-2-024271267078') }

    it 'logs in a user without an email but does not update user with details from verification' do
      create(
        :verification,
        user: user,
        method_name: 'rm_unify',
        hashed_uid: Verification::VerificationService.new.send(:hashed_uid, saml_auth_response[:uid], 'rm_unify')
      )
      expect(User.first.first_name).to eq('Bob') # Check the user is created correctly

      get '/auth/rm_unify?sso_pathname=/en/another-page&test_param=test'
      follow_redirect!

      expect(response).to redirect_to('/en/another-page?test_param=test&sso_flow=signin&sso_success=true')
      expect(cookies[:cl2_jwt]).to be_present
      jwt_payload = JWT.decode(cookies[:cl2_jwt], nil, false).first
      expect(User.first.id).to eq jwt_payload['sub']
      expect(User.first.first_name).to eq('Bob')
      expect(User.first.last_name).to eq('Jelly')
      expect(User.first.verified).to be(true)
      expect(User.first.unique_code).to eq('9208-2002-2-024271267078')
    end
  end
end
