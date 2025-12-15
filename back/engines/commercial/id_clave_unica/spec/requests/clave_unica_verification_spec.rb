# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'clave_unica verification' do
  before do
    SettingsService.new.activate_feature! 'user_confirmation'
    @user = create(:user, first_name: 'Rudolphi', last_name: 'Raindeari')
    @token = AuthToken::AuthToken.new(payload: @user.to_token_payload).token
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:clave_unica] = OmniAuth::AuthHash.new({
      'provider' => 'clave_unica',
      'uid' => '44444444',
      'info' => {
        'name' => '{"nombres"=>["Maria", "Carmen", "De los angeles"], "apellidos"=>["Del rio", "Gonzalez"]}',
        'email' => nil,
        'email_verified' => nil,
        'nickname' => nil,
        'first_name' => nil,
        'last_name' => nil,
        'gender' => nil,
        'image' => nil,
        'phone' => nil,
        'urls' => { 'website' => nil }
      },
      'credentials' => {
        'id_token' => 'eyJhbGciOiJSUzI1NiIsIxxxZCI6ImM1NjEyODkyNDYxMzYzM2Y3NWEzODMxNzczYjUzNjczIn0.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmNsYXZldW5pY2EuZ29iLmNsL29wZW5pZCIsInN1YiI6IjQ0NDQ0NDQ0IiwiYXVkIjoiYWE1MzA0NmY3YzdkNGVhOTkyODFkMDYyYzQwZGM5ZjYiXXXleHAiOjE2ODI3MDgxMzksImlhdCI6MTY4MjcwNzUzOSwibm9uY2UiOiI5YjE3MjZhNWQwM2JmOGYwMjU4YjMxZTZhMzA5NzY0NSIsImF0X2hhc2giOiJSZDByNmMwSlRkTklqMEl4Yk16bDN3IiwiYXV0aF90aW1lIjoxNjgyNzA3NTM5fQ.QlpvOZwEbN50Vh4NWx-p4rqRClwdxQnR0gERmRxxx32hIQ3cB8jdqKO3Yo4RSYs1xrywQ-CQdPpwnATfoIVL07QbVPb8x1U8o2o3SaTaMH9cMYG4ldNYCGjO1SUZ0RhBHAZeBWpm44LLolk9w8YgxXhs7P1sZhCQuTk--h1TG0-9wRgjmyxuqQieVH2GZfkc4VD9n14L1J6iNyEgrRzNG7byI0VbBvn1MVURf37cbVYuSx9aM0BZUmXUiap8iD2xWhQkvfWttSc1_gOl2Z11ohH5BA5GAAGIiTpfj8TgbYxvK4cKzjAw93-QrlizaXBp2D515cCPtEVOVgC4stwhaw',
        'token' => 'eb7bd915ab1b455ca17460935e3fe731',
        'refresh_token' => '0388f428536d411aa2e1cd5e0ea8aff8',
        'expires_in' => 3600,
        'scope' => nil
      },
      'extra' => {
        'raw_info' => {
          'sub' => '44444444',
          'RolUnico' => { 'numero' => 44_444_444, 'DV' => '4', 'tipo' => 'RUN' },
          'name' => {
            'nombres' => ['Maria', 'Carmen', 'De los angeles'],
            'apellidos' => ['Del rio', 'Gonzalez']
          },
          'iss' => 'https://accounts.claveunica.gob.cl/openid',
          'aud' => 'aa53046f1c7d4ea99281d062c40dc9f6',
          'exp' => 1_682_708_139,
          'iat' => 1_682_707_539,
          'nonce' => '9b1726a1d03bf8f0258b31e6a3097645',
          'at_hash' => 'Rd0r6c1JTdNIj0IxbMzl3w',
          'auth_time' => 1_682_707_539
        }
      }
    })

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{ name: 'clave_unica', client_id: 'fake', client_secret: 'fake' }]
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_to_create_verified_user(user)
    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Maria Carmen De los angeles',
      last_name: 'Del rio Gonzalez'
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'clave_unica',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, '44444444', 'clave_unica')
    })
  end

  def expect_to_create_verified_and_identified_user(user)
    expect_to_create_verified_user(user)
    expect(user.identities.first).to have_attributes({
      provider: 'clave_unica',
      user_id: user.id,
      uid: '44444444',
      auth_hash: instance_of(Hash)
    })
  end

  it 'successfully verifies a user' do
    get "/auth/clave_unica?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')

    expect_to_create_verified_user(@user)
  end

  it "successfully verifies a user that hasn't completed her registration" do
    @user.update!(registration_completed_at: nil)

    get "/auth/clave_unica?token=#{@token}&verification_pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?verification_success=true')
    expect(@user.reload).to have_attributes({
      verified: true
    })
  end

  it 'redirect to a path without an ending slash when no pathname is passed' do
    get "/auth/clave_unica?token=#{@token}"
    follow_redirect!
    expect(response).to redirect_to('/en?verification_success=true')
  end

  it 'fails when the RUT has already been used' do
    create(
      :verification,
      method_name: 'clave_unica',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, '44444444', 'clave_unica')
    )

    get "/auth/clave_unica?token=#{@token}&verification_pathname=/some-page"
    follow_redirect!

    expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
    expect(@user.reload).to have_attributes({
      verified: false,
      first_name: 'Rudolphi',
      last_name: 'Raindeari'
    })
  end

  it 'creates user when the authentication token is not passed' do
    expect(User.count).to eq(1)
    get '/auth/clave_unica?param=some-param'
    follow_redirect!

    expect(User.count).to eq(2)

    user = User.order(created_at: :asc).last
    expect_to_create_verified_and_identified_user(user)

    expect(user).not_to eq(@user)
    expect(user).to have_attributes({
      email: nil,
      password_digest: nil
    })

    expect(response).to redirect_to('/en/?param=some-param&sso_flow=signup&sso_success=true')
  end

  it 'does not send email to empty address (when just registered)' do
    get '/auth/clave_unica'
    follow_redirect!

    expect(ActionMailer::Base.deliveries).to be_empty
  end

  context 'when verification is already taken by new user' do
    before do
      get '/auth/clave_unica'
      follow_redirect!
    end

    let!(:new_user) do
      User.order(created_at: :asc).last.tap do |user|
        expect(user).to have_attributes({ email: nil })
        expect_to_create_verified_and_identified_user(user)
      end
    end

    context 'when verified registration is completed by new user' do
      before { new_user.update!(email: Faker::Internet.email) }

      it 'does not verify another user and does not delete previously verified new user' do
        get "/auth/clave_unica?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
        expect(@user.reload).to have_attributes({
          verified: false,
          first_name: 'Rudolphi',
          last_name: 'Raindeari'
        })

        expect(new_user.reload).to eq(new_user)
      end
    end

    context 'when verified registration is not completed by new user' do
      it 'successfully verifies another user and deletes previously verified blank new user' do
        get "/auth/clave_unica?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/en/some-page?verification_success=true')
        expect_to_create_verified_user(@user.reload)
        expect { new_user.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'update email after registration with ClaveUnica' do
    before do
      configuration = AppConfiguration.instance
      configuration.settings['password_login'] = {
        'allowed' => true,
        'enabled' => true,
        'enable_signup' => true,
        'minimum_length' => 8
      }
      configuration.save!
    end

    context 'email confirmation enabled' do
      it 'creates user that can add & confirm her email' do
        get '/auth/clave_unica'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_to_create_verified_and_identified_user(user)
        expect(user.email).to be_nil
        expect(user.active?).to be(true)
        expect(user.confirmation_required?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(0)

        headers = { 'Authorization' => authorization_header(user) }

        post '/web_api/v1/user/request_code_email_change', params: { request_code: { new_email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ new_email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(true)
        expect(user.active?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(1)

        post '/web_api/v1/user/confirm_code_email_change', params: { confirmation: { code: user.email_confirmation_code } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
        expect(user).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.new_email).to be_nil
      end

      it 'creates user that can enter email, change it and then confirm it' do
        get '/auth/clave_unica'
        follow_redirect!

        user = User.order(created_at: :asc).last
        headers = { 'Authorization' => authorization_header(user) }

        post '/web_api/v1/user/request_code_email_change', params: { request_code: { new_email: '1@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ new_email: '1@example.org' })

        post '/web_api/v1/user/request_code_email_change', params: { request_code: { new_email: '2@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ new_email: '2@example.org' })

        post '/web_api/v1/user/confirm_code_email_change', params: { confirmation: { code: user.email_confirmation_code } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.confirmation_required?).to be(false)
        expect(user).to have_attributes({ email: '2@example.org' })
        expect(user.new_email).to be_nil
      end

      it 'allows users to be active without adding an email & confirmation' do
        get '/auth/clave_unica'
        follow_redirect!

        get '/auth/clave_unica'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_to_create_verified_and_identified_user(user)
        expect(user.email).to be_nil
        expect(user.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
      end
    end

    context 'email confirmation disabled' do
      before do
        configuration = AppConfiguration.instance
        configuration.settings['user_confirmation'] = {
          'enabled' => false,
          'allowed' => false
        }
        configuration.save!
      end

      it 'creates user that can update her email' do
        get '/auth/clave_unica'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_to_create_verified_and_identified_user(user)

        headers = { 'Authorization' => authorization_header(user) }
        patch '/web_api/v1/users/update_email_unconfirmed', params: { user: { email: 'newcoolemail@example.org' } }, headers: headers

        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(false)
      end
    end
  end

  context 'when checking against list of verified RUTs registered in municipality' do
    context 'when RUT is added to list' do
      before { IdIdCardLookup::IdCard.create!(card_id: '44.444.444-4') }

      it 'sets rut_verified custom field' do
        get "/auth/clave_unica?token=#{@token}"
        follow_redirect!

        expect(@user.reload.custom_field_values).to eq({ 'rut_verified' => true })
      end
    end

    context 'when RUT is not added to list' do
      before { IdIdCardLookup::IdCard.create!(card_id: '55.555.555-5') }

      it 'does not set rut_verified custom field' do
        get "/auth/clave_unica?token=#{@token}"
        follow_redirect!

        expect(@user.reload.custom_field_values).to eq({})
      end
    end
  end
end
