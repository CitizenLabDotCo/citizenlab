# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'Azure AD B2C authentication' do
  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:azureactivedirectory_b2c] = OmniAuth::AuthHash.new(
      {
        'provider' => 'azureactivedirectory_b2c',
        'uid' => '7778bdce-1f2d-4b37-aa14-ab030c7091de',
        'info' => {
          'name' => nil,
          'email' => nil
        },
        'extra' => {
          'raw_info' => {
            'ver' => '1.0',
            'iss' => 'https://citizenlabtest.b2clogin.com/tfp/9272e410-597e-498d-a253-8dc97a38f541/b2c_1_default_signup_signin_flow/v2.0/',
            'sub' => '7778bdce-1f2d-4b37-aa14-ab030c7091de',
            'aud' => '67335ae3-d434-4355-92e1-856719f9fdfd',
            'exp' => 1_711_452_743,
            'nonce' => '7294c51a56fb17a559526f27d632a89f',
            'iat' => 1_711_449_143,
            'auth_time' => 1_711_449_143,
            'given_name' => 'Alexander',
            'family_name' => 'CitizenLab',
            'emails' => ['alexander@citizenlab.co'],
            'tfp' => 'B2C_1_default_signup_signin_flow',
            'nbf' => 1_711_449_143
          }
        }
      }
    )

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['azure_ad_b2c_login'] = {
      allowed: true,
      enabled: true,
      tenant_name: 'citizenlabtest',
      tenant_id: '9272e410-597e-498d-a253-8dc97a38f541',
      policy_name: 'B2C_1_default_signup_signin_flow',
      client_id: 'fakeid'
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_user_to_have_attributes(user)
    expect(user.identities.first).to have_attributes({
      provider: 'azureactivedirectory_b2c',
      user_id: user.id,
      uid: '7778bdce-1f2d-4b37-aa14-ab030c7091de'
    })
    expect(user).to have_attributes({
      verified: false,
      first_name: 'Alexander',
      last_name: 'CitizenLab',
      email: 'alexander@citizenlab.co',
      locale: 'en'
    })
  end

  it 'successfully authenticates new user' do
    get '/auth/azureactivedirectory_b2c?random-passthrough-param=somevalue'
    follow_redirect!

    expect(response).to redirect_to('/en/?random-passthrough-param=somevalue&sso_flow=signup&sso_success=true')

    expect_user_to_have_attributes(User.last)
    expect(cookies[:cl2_jwt]).to be_present
  end
end
