require 'rails_helper'
require 'rspec_api_documentation/dsl'


describe "bosa_fas verification" do

  before do
    @user = create(:user, first_name: 'Rudolphi', last_name: 'Raindeari')
    @token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:bosa_fas] = OmniAuth::AuthHash.new({
      "provider" => 'bosa_fas',
      "uid"=>nil,
      "info"=>
        {"name"=>nil,
         "email"=>nil,
         "nickname"=>nil,
         "first_name"=>nil,
         "last_name"=>nil,
         "gender"=>nil,
         "image"=>nil,
         "phone"=>nil,
         "urls"=>{"website"=>nil}},
      "credentials"=>
        {"id_token"=>
          "eyJ0eXAiOiJKV1QiLCJraWQiOiJHRGVGQlpyY2ZxeFoyQ0lQQllZTWdqUmh3blk9IiwiYWxnIjoiUlMyNTYifQ.eyJhdF9oYXNoIjoiYTVkaHQ2WXZWSUdfUkFVcnExYnEwdyIsInN1YiI6Ijg3MDcwNDE5MzExIiwiYXVkaXRUcmFja2luZ0lkIjoiZjdmM2Q2MDQtN2FkNi00NmExLTk0OGItMTViNjkzNjE5YjJjLTQ0OTk5OSIsImFtciI6WyJ1cm46YmU6ZmVkaWN0OmlhbTpmYXM6TGV2ZWw1MDAiXSwiaXNzIjoiaHR0cDovL2lkcC5pYW1mYXMuaW50LmJlbGdpdW0uYmU6ODAvZmFzL29hdXRoMiIsInRva2VuTmFtZSI6ImlkX3Rva2VuIiwibm9uY2UiOiIxYjI5YmM0NWIxY2I4NmEyZDM0YmYyMDU0MDM0MzliYSIsImF1ZCI6IkNpdGl6ZW5MYWJfUGFydFBsYXRfSGFiYXkiLCJjX2hhc2giOiJHNUwxbGJDcFpIR1ZQY2VkSEZmZXF3IiwiYWNyIjoiMCIsIm9yZy5mb3JnZXJvY2sub3BlbmlkY29ubmVjdC5vcHMiOiJobnNiaGhNbXRQZ1JNNktTYl9Kb1Nmb0tudEUiLCJzX2hhc2giOiJJUjNFUFlHRHVCbTFnc19ac0ppRTd3IiwiYXpwIjoiQ2l0aXplbkxhYl9QYXJ0UGxhdF9IYWJheSIsImF1dGhfdGltZSI6MTU3MzY3MzczNSwicmVhbG0iOiIvIiwiZXhwIjoxNTczNjc3MzQyLCJ0b2tlblR5cGUiOiJKV1RUb2tlbiIsImlhdCI6MTU3MzY3Mzc0Mn0.ak3gaqNmFWERjgNvGDe31v1OMCnP_hIv6vjW-f8awae5xyTZi0X3T5sNLhvrF5y6RYxiAmBa24hYNYaCxAYsJzDkI5sUqcRrhj_4FSuSA9vqa48r0ULCoq2xQmWwLUz-FeCzRHZ0QH3jiKem0UiUYYDG3IcEue9ccQmFSLKTFT617hMH1ag-7bElGhXHantiDVqrbm0Qszak6KlSTUfNooFRY7XO3ctBbTBiBEmYwCRt6JLlB4KCEf9Uv1DUx8spfhJfVxlFFdHmVLBzOVoRbdNjziyLebQfs8AY7dp1JvVPLDSjJSclt1-29PwsjhW8KCsaIIPbfvSMDkGnHfeIRQ",
         "token"=>"2QBbtaIDrrJt8dWSr2bjKP7E6DU",
         "refresh_token"=>"tygp3Gz_xUUHJKJhxbL4qBJ1nXQ",
         "expires_in"=>3599,
         "scope"=>"openid profile egovnrn"},
      "extra"=>
        {"raw_info"=>
          {"prefLanguage"=>"en",
           "mail"=>"hypoliet.verhipperd@gmail.com",
           "surname"=>"Verhipperd",
           "givenName"=>"Hypoliet",
           "iss"=>"http://idp.iamfas.int.belgium.be:80/fas/oauth2",
           "egovNRN"=>"93051822361",
           "fedid"=>"a8fb031d4ef30757ea70912b2876a4c2878309e0"}}})

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{name: 'bosa_fas', environment: 'integration', identifier: 'fake', secret: 'fake'}],
    }
    configuration.save!
    host! 'example.org'
  end

  it "successfully verifies a user" do
    get "/auth/bosa_fas?token=#{@token}&random-passthrough-param=somevalue&pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to("/en/yipie?random-passthrough-param=somevalue&verification_success=true")

    expect(@user.reload).to have_attributes({
      verified: true,
      first_name: 'Hypoliet',
      last_name: 'Verhipperd'
    })
    expect(@user.verifications.first).to have_attributes({
      method_name: "bosa_fas",
      user_id: @user.id,
      active: true,
      hashed_uid: 'b711c606279e1e0ee103a05c6cadc93cd65210f705ccf4b9dcbd1a68af0a33b9'
    })
  end

  it "successfully verifies a user that hasn't completed her registration" do
    @user.update!(registration_completed_at: nil)

    get "/auth/bosa_fas?token=#{@token}&pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to("/en/yipie?verification_success=true")
    expect(@user.reload).to have_attributes({
      verified: true,
    })
  end

  it "redirect to a path without an ending slash when no pathname is passed" do
    get "/auth/bosa_fas?token=#{@token}"
    follow_redirect!
    expect(response).to redirect_to("/en?verification_success=true")
  end

  it "fails when the RRN has already been used" do
    create(:verification,
      method_name: 'bosa_fas',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, '93051822361', 'bosa_fas')
    )

    get "/auth/bosa_fas?token=#{@token}&pathname=/some-page"
    follow_redirect!

    expect(response).to redirect_to('/some-page?verification_error=true&error=taken')
    expect(@user.reload).to have_attributes({
      verified: false,
      first_name: 'Rudolphi',
      last_name: 'Raindeari'
    })
  end

  it "fails when the authentication token is not passed" do
    get "/auth/bosa_fas?pathname=/whatever-page"
    follow_redirect!

    expect(response).to redirect_to('/whatever-page?verification_error=true&error=no_token_passed')
  end
end