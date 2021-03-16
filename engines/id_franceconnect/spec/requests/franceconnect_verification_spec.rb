require 'rails_helper'
require 'rspec_api_documentation/dsl'


describe "franceconnect verification" do

  before do
    @user = create(:user)
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:franceconnect] = OmniAuth::AuthHash.new(
      {"provider"=>"franceconnect",
       "uid"=>"cfdbc2447d7a579dd48bc67e43ef44a03c208cb8c218450168cfc3ba89f502f6v1",
       "info"=>
        {"name"=>nil,
         "email"=>"wossewodda-3728@yopmail.com",
         "nickname"=>"",
         "first_name"=>"Angela Claire Louise",
         "last_name"=>"DUBOIS",
         "gender"=>"female",
         "image"=>nil,
         "phone"=>nil,
         "urls"=>{"website"=>nil}},
       "credentials"=>
        {"id_token"=>
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2ZjcC5pbnRlZzAxLmRldi1mcmFuY2Vjb25uZWN0LmZyIiwic3ViIjoiY2ZkYmMyNDQ3ZDdhNTc5ZGQ0OGJjNjdlNDNlZjQ0YTAzYzIwOGNiOGMyMTg0NTAxNjhjZmMzYmE4OWY1MDJmNnYxIiwiYXVkIjoiMGI4YmEwZjlhMjNmMTZiY2JkODZjNzgzYjJhNDFmZDBjZWYwZWE5NjhlMjUzNzM0ZGU3MWY2NDFlMGU2NjA1NyIsImV4cCI6MTU3MzczMTMxOSwiaWF0IjoxNTczNzMxMjU5LCJub25jZSI6ImE1ZjgwOWM1MTQ0MTVkMDEyMGRjNmJkZGRiZTgxMWYwIiwiaWRwIjoiRkMiLCJhY3IiOiJlaWRhczEiLCJhbXIiOm51bGx9.sa9WM_VBsMb0Rku6KTg6Pk90UBmP46bnOABojcw0cYM",
         "token"=>"535a2da9-98a9-4888-8c0a-fea052b51f04",
         "refresh_token"=>nil,
         "expires_in"=>60,
         "scope"=>nil},
       "extra"=>
        {"raw_info"=>
          {"sub"=>
            "cfdbc2447d7a579dd48bc67e43ef44a03c208cb8c218450168cfc3ba89f502f6v1",
           "given_name"=>"Angela Claire Louise",
           "family_name"=>"DUBOIS",
           "gender"=>"female",
           "birthdate"=>"1962-08-24",
           "preferred_username"=>"",
           "email"=>"wossewodda-3728@yopmail.com",
           "address"=>
            {"country"=>"France",
             "formatted"=>"France Paris 75107 20 avenue de Ségur",
             "locality"=>"Paris",
             "postal_code"=>"75107",
             "street_address"=>"20 avenue de Ségur"}}}}
    )

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['franceconnect_login'] = {
      allowed: true,
      enabled: true,
      environment: 'integration',
      identifier: 'fakeid',
      secret: 'fakesecret'
    }
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [
        {
          name: 'franceconnect'
        }
      ]
    }
    configuration.save!
    host! 'example.org'
  end

  it "successfully authenticates and verifies a new user" do
    get "/auth/franceconnect?random-passthrough-param=somevalue"
    follow_redirect!

    expect(response).to redirect_to("/fr-FR/complete-signup?random-passthrough-param=somevalue")

    user = User.find_by(email: 'wossewodda-3728@yopmail.com')

    expect(user).to have_attributes({
      verified: true,
      first_name: 'Angela Claire Louise',
      last_name: 'Dubois'
    })
    expect(user.identities.first).to have_attributes({
      provider: "franceconnect",
      user_id: user.id,
    })
    expect(user.verifications.first).to have_attributes({
      method_name: "franceconnect",
      user_id: user.id,
      active: true,
      hashed_uid: '84d610ebae19b5e09aa5621e006746c4cd568bec352e1d98d48643e6765a82e7'
    })
    expect(cookies[:cl2_jwt]).to be_present
  end

end