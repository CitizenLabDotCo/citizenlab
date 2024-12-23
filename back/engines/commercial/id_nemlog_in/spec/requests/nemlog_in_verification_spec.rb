# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe IdNemlogIn::NemlogInOmniauth do
  let(:user) { create(:user, first_name: 'Rudolphi', last_name: 'Raindeari') }
  let(:token) { AuthToken::AuthToken.new(payload: user.to_token_payload).token }
  let(:saml_auth_response) do
    OmniAuth::AuthHash.new(
      {
        'provider' => 'nemlog_in',
        'uid' => 'https://data.gov.dk/model/core/eid/professional/uuid/82dc2343-7f37-465d-a523-7f3e24feca46',
        'info' => { 'name' => nil, 'email' => nil, 'first_name' => nil, 'last_name' => nil },
        'credentials' => {},
        'extra' => {
          'raw_info' => OneLogin::RubySaml::Attributes.new({
            # MitID Ervherv (professional) attributes:
            # 'https://data.gov.dk/concept/core/nsis/aal' => ['Substantial'],
            # 'https://data.gov.dk/concept/core/nsis/ial' => ['Substantial'],
            # 'https://data.gov.dk/concept/core/nsis/loa' => ['Substantial'],
            # 'https://data.gov.dk/model/core/eid/age' => ['78'],
            # 'https://data.gov.dk/model/core/eid/cprUuid' => ['81cf0ed2-e28d-45bd-a860-f093b2ddf1c9'],
            # 'https://data.gov.dk/model/core/eid/dateOfBirth' => ['28-08-1944'],
            # 'https://data.gov.dk/model/core/eid/email' => ['alexander@citizenlab.co'], # not present in personal attributes
            # 'https://data.gov.dk/model/core/eid/firstName' => ['Terje'],
            # 'https://data.gov.dk/model/core/eid/fullName' => ['Terje Hermansen'],
            # 'https://data.gov.dk/model/core/eid/lastName' => ['Hermansen'],
            # 'https://data.gov.dk/model/core/eid/professional/cvr' => ['93005620'],
            # 'https://data.gov.dk/model/core/eid/professional/orgName' => ['Testorganisation nr. 93005620'],
            # 'https://data.gov.dk/model/core/eid/professional/rid' => ['4294268104'],
            # 'https://data.gov.dk/model/core/eid/professional/uuid/persistent' => ['ec6ec845-958b-459a-bb8a-6adbdcd71b39'],
            # 'https://data.gov.dk/model/core/specVersion' => ['OIO-SAML-3.0']

            # Personal attributes:
            'https://data.gov.dk/concept/core/nsis/aal' => ['Substantial'],
            'https://data.gov.dk/concept/core/nsis/ial' => ['Substantial'],
            'https://data.gov.dk/concept/core/nsis/loa' => ['Substantial'],
            'https://data.gov.dk/model/core/eid/age' => ['78'],
            'https://data.gov.dk/model/core/eid/cprUuid' => ['81cf0ed2-e28d-45bd-a860-f093b2ddf1c9'],
            'https://data.gov.dk/model/core/eid/dateOfBirth' => ['28-08-1944'],
            'https://data.gov.dk/model/core/eid/firstName' => ['Terje'],
            'https://data.gov.dk/model/core/eid/fullName' => ['Terje Hermansen'],
            'https://data.gov.dk/model/core/eid/lastName' => ['Hermansen'],
            'https://data.gov.dk/model/core/eid/person/pid' => ['9208-2002-2-024271267078'],
            'https://data.gov.dk/model/core/specVersion' => ['OIO-SAML-3.0']
          })
        }
      }
    )
  end

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:nemlog_in] = saml_auth_response
    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'nemlog_in',
        environment: 'pre_production_integration',
        issuer: 'https://example.com',
        private_key: "-----BEGIN PRIVATE KEY-----\n123123\n-----END PRIVATE KEY-----",
        minimum_age: 15
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  it 'successfully verifies a user' do
    get "/auth/nemlog_in?token=#{token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')

    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Rudolphi',
      last_name: 'Raindeari'
    })
    expect(user.custom_field_values).to have_key('municipality_code')
    expect(user.verifications.first).to have_attributes({
      method_name: 'nemlog_in',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, saml_auth_response[:uid], 'nemlog_in')
    })
  end

  it "successfully verifies a user that hasn't completed her registration" do
    user.update!(registration_completed_at: nil)

    get "/auth/nemlog_in?token=#{token}&verification_pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?verification_success=true')
    expect(user.reload).to have_attributes({
      verified: true
    })
  end

  it 'redirect to a path without an ending slash when no pathname is passed' do
    get "/auth/nemlog_in?token=#{token}"
    follow_redirect!
    expect(response).to redirect_to('/en?verification_success=true')
  end

  it 'fails when the cprUuid has already been used' do
    create(
      :verification,
      method_name: 'nemlog_in',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, saml_auth_response[:uid], 'nemlog_in')
    )

    get "/auth/nemlog_in?token=#{token}&verification_pathname=/some-page"
    follow_redirect!

    expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
    expect(user.reload).to have_attributes({
      verified: false,
      first_name: 'Rudolphi',
      last_name: 'Raindeari'
    })
  end

  context "when validating user's age" do
    it 'does not verify a user under specified age limit' do
      saml_auth_response.extra.raw_info['https://data.gov.dk/model/core/eid/age'] = ['14']

      get "/auth/nemlog_in?token=#{token}&verification_pathname=/en/some-page"
      follow_redirect!

      expect(response).to redirect_to('/en/some-page?verification_error=true&error_code=not_entitled_under_minimum_age')
      expect(user.reload).to have_attributes({
        verified: false
      })
    end

    it 'verifies a user over specified age limit' do
      saml_auth_response.extra.raw_info['https://data.gov.dk/model/core/eid/age'] = ['15']

      get "/auth/nemlog_in?token=#{token}&random-passthrough-param=somevalue&verification_pathname=/some-page"
      follow_redirect!

      expect(response).to redirect_to('/en/some-page?random-passthrough-param=somevalue&verification_success=true')
      expect(user.reload).to have_attributes({
        verified: true
      })
    end
  end

  context 'when handling birthyear' do
    context 'when birthyear field is configured' do
      before do
        configuration = AppConfiguration.instance
        settings = configuration.settings
        settings['verification']['verification_methods'].first['birthyear_custom_field_key'] = 'birthyear'
        configuration.save!
      end

      it 'stores the birthyear in the custom field' do
        get "/auth/nemlog_in?token=#{token}&verification_pathname=/some-page"
        follow_redirect!

        expect(user.reload.custom_field_values['birthyear']).to eq(1944)
      end
    end

    context 'when birthyear field is not configured' do
      before do
        configuration = AppConfiguration.instance
        settings = configuration.settings
        settings['verification']['verification_methods'].delete('birthyear_custom_field_key')
        configuration.save!
      end

      it 'stores the birthyear in the custom field' do
        get "/auth/nemlog_in?token=#{token}&verification_pathname=/some-page"
        follow_redirect!

        expect(user.reload.custom_field_values['birthyear']).to be_nil
      end
    end
  end

  context 'verifying and creating a new user' do
    let(:user) { nil }

    it 'creates a user with a unique ID and no email, then logs them in' do
      get '/auth/nemlog_in?sso_pathname=/en/whatever-page&other_param=123'
      follow_redirect!

      expect(response).to redirect_to('/en/whatever-page?other_param=123&sso_flow=signup&sso_success=true')
      expect(cookies[:cl2_jwt]).to be_present
      jwt_payload = JWT.decode(cookies[:cl2_jwt], nil, false).first
      expect(User.first.id).to eq jwt_payload['sub']
      expect(User.first.email).to be_nil
      expect(User.first.email_confirmed_at).to be_nil
      expect(User.first.first_name).to eq('Terje')
      expect(User.first.last_name).to eq('Hermansen')
      expect(User.first.verified).to be(true)
      expect(User.first.unique_code).to eq('9208-2002-2-024271267078')
    end

    it 'does not create a user or log them in if the user is under the minimum age' do
      saml_auth_response.extra.raw_info['https://data.gov.dk/model/core/eid/age'] = ['14']

      get '/auth/nemlog_in?sso_pathname=/en/whatever-page'
      follow_redirect!

      expect(response).to redirect_to('/en/whatever-page?error_code=not_entitled_under_minimum_age&authentication_error=true')
      expect(cookies[:cl2_jwt]).to be_nil
      expect(User.count).to eq 0
    end
  end

  context 'verifying and logging in a user' do
    let!(:user) { create(:user, first_name: 'Bob', last_name: 'Jelly', email: nil, unique_code: '9208-2002-2-024271267078') }

    it 'logs in a user without an email but does not update user with details from verification' do
      create(
        :verification,
        user: user,
        method_name: 'nemlog_in',
        hashed_uid: Verification::VerificationService.new.send(:hashed_uid, saml_auth_response[:uid], 'nemlog_in')
      )
      expect(User.first.first_name).to eq('Bob') # Check the user is created correctly

      get '/auth/nemlog_in?sso_pathname=/en/another-page&test_param=test'
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
