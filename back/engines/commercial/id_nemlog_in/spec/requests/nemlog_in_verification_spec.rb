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
            'https://data.gov.dk/concept/core/nsis/ial' => ['Substantial'],
            'https://data.gov.dk/model/core/eid/fullName' => ['Terje Hermansen'],
            'https://data.gov.dk/model/core/eid/firstName' => ['Terje'],
            'https://data.gov.dk/model/core/eid/lastName' => ['Hermansen'],
            'https://data.gov.dk/model/core/eid/email' => ['alexander@citizenlab.co'],
            'https://data.gov.dk/model/core/eid/age' => ['78'],
            'https://data.gov.dk/model/core/eid/cprUuid' => ['81cf0ed2-e28d-45bd-a860-f093b2ddf1c9'],
            'https://data.gov.dk/model/core/eid/dateOfBirth' => ['28-08-1944'],
            'https://data.gov.dk/model/core/eid/professional/uuid/persistent' => ['ec6ec845-958b-459a-bb8a-6adbdcd71b39'],
            'https://data.gov.dk/model/core/eid/professional/rid' => ['4294268104'],
            'https://data.gov.dk/model/core/eid/professional/cvr' => ['93005620'],
            'https://data.gov.dk/model/core/eid/professional/orgName' => ['Testorganisation nr. 93005620'],
            'https://data.gov.dk/model/core/specVersion' => ['OIO-SAML-3.0'],
            'https://data.gov.dk/concept/core/nsis/loa' => ['Substantial'],
            'https://data.gov.dk/concept/core/nsis/aal' => ['Substantial']
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
        private_key: "-----BEGIN PRIVATE KEY-----\n123123\n-----END PRIVATE KEY-----"
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  it 'successfully verifies a user' do
    get "/auth/nemlog_in?token=#{token}&random-passthrough-param=somevalue&pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')

    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Rudolphi',
      last_name: 'Raindeari'
    })
    expect(user.custom_field_values).to have_key('municipality_code')
    uid = 'https://data.gov.dk/model/core/eid/professional/uuid/82dc2343-7f37-465d-a523-7f3e24feca46'
    expect(user.verifications.first).to have_attributes({
      method_name: 'nemlog_in',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, uid, 'nemlog_in')
    })
  end

  it "successfully verifies a user that hasn't completed her registration" do
    user.update!(registration_completed_at: nil)

    get "/auth/nemlog_in?token=#{token}&pathname=/yipie"
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
    uid = 'https://data.gov.dk/model/core/eid/professional/uuid/82dc2343-7f37-465d-a523-7f3e24feca46'
    create(
      :verification,
      method_name: 'nemlog_in',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, uid, 'nemlog_in')
    )

    get "/auth/nemlog_in?token=#{token}&pathname=/some-page"
    follow_redirect!

    expect(response).to redirect_to('/some-page?verification_error=true&error=taken')
    expect(user.reload).to have_attributes({
      verified: false,
      first_name: 'Rudolphi',
      last_name: 'Raindeari'
    })
  end

  it 'fails when the authentication token is not passed' do
    get '/auth/nemlog_in?pathname=/whatever-page'
    follow_redirect!

    expect(response).to redirect_to('/whatever-page?verification_error=true&error=no_token_passed')
  end

  context 'when tenant is Copenhagen' do
    before do
      configuration = AppConfiguration.instance
      settings = configuration.settings
      settings['verification']['verification_methods'][0]['issuer'] = 'https://kobenhavntaler.kk.dk'
      configuration.save!
    end

    it 'does not verify an under 15-year-old' do
      saml_auth_response.extra.raw_info.attributes['https://data.gov.dk/model/core/eid/age'][0] = '14'

      get "/auth/nemlog_in?token=#{token}&random-passthrough-param=somevalue&pathname=/some-page"
      follow_redirect!

      expect(response).to redirect_to('/authentication-error?sso_pathname=%2Fsome-page&sso_response=true&error_code=not_entitled_under_15_years_of_age')
    end

    it 'verifies 15-year-old' do
      saml_auth_response.extra.raw_info.attributes['https://data.gov.dk/model/core/eid/age'][0] = '15'

      get "/auth/nemlog_in?token=#{token}&random-passthrough-param=somevalue&pathname=/some-page"
      follow_redirect!

      expect(response).to redirect_to('/en/some-page?random-passthrough-param=somevalue&verification_success=true')
    end
  end
end
