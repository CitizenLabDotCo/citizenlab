# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'criipto verification' do
  let(:auth_hash) do
    {
      'provider' => 'criipto',
      'uid' => '{29d14ea0-6e16-4732-86ac-5de87a941784}',
      'info' => {
        'name' => 'Bulenga Poulsen',
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
        'id_token' =>
        # rubocop:disable Layout/LineLength
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjhCREY3OUEzRkY5OTdFQTg1QjYyRjk1OUQzRDdCMzdFRDAyMjhFOTAifQ.eyJpc3MiOiJodHRwczovL2tvYmVuaGF2bi10ZXN0LmNyaWlwdG8uaWQiLCJhdWQiOiJ1cm46bXk6YXBwbGljYXRpb246aWRlbnRpZmllcjo0MDc3OTMiLCJub25jZSI6ImJmNTgxMWRmMGNiZjM5Mjc1NGNhMjUyYTI5YzBjYzM2IiwiaWRlbnRpdHlzY2hlbWUiOiJka21pdGlkIiwiYXV0aGVudGljYXRpb250eXBlIjoidXJuOmdybjphdXRobjpkazptaXRpZDpzdWJzdGFudGlhbCIsImF1dGhlbnRpY2F0aW9ubWV0aG9kIjoiYXBwOjE2OTI2MjE4ODg5NTY6U1VCU1RBTlRJQUw6U1VCU1RBTlRJQUw6SElHSDpISUdIIiwiYXV0aGVudGljYXRpb25pbnN0YW50IjoiMjAyMy0wOC0yMVQxMjo0NTowMS43MzNaIiwibmFtZWlkZW50aWZpZXIiOiIyOWQxNGVhMDZlMTY0NzMyODZhYzVkZTg3YTk0MTc4NCIsInN1YiI6InsyOWQxNGVhMC02ZTE2LTQ3MzItODZhYy01ZGU4N2E5NDE3ODR9Iiwic2Vzc2lvbmluZGV4IjoiNTMxNjkwY2UtOTc5Mi00OTQ5LThhMTEtZjNmNWE0YzUwNGI1IiwibG9BIjoiU1VCU1RBTlRJQUwiLCJpYWwiOiJTVUJTVEFOVElBTCIsImFhbCI6IlNVQlNUQU5USUFMIiwiZmFsIjoiSElHSCIsInV1aWQiOiI0MTBhNzdlYy00Zjg1LTQ2ZTQtYWFlZi1iZGJiZDFhOTUxZjIiLCJjcHJOdW1iZXJJZGVudGlmaWVyIjoiMzExMjc3Mjg0NiIsImJpcnRoZGF0ZSI6IjE5NzctMTItMzEiLCJkYXRlb2ZiaXJ0aCI6IjE5NzctMTItMzEiLCJhZ2UiOiI0NSIsIm5hbWUiOiJCdWxlbmdhIFBvdWxzZW4iLCJyZWZUZXh0SGVhZGVyIjoiTG9nIG9uIGF0IENyaWlwdG8iLCJyZWZUZXh0Qm9keSI6ImxvY2FsIGRldmVsb3BtZW50IHRlc3QgKEtvZW4pIiwiY291bnRyeSI6IkRLIiwiaWF0IjoxNjkyNjIxOTAyLCJuYmYiOjE2OTI2MjE5MDIsImV4cCI6MTY5MjYzOTg4OH0.1dMJe80vvEFt4EFIF2kd_Tdy5UPEEw3qGjjVuNYHhw1Oonxpjtpjm1t-Q8YiMUZ_zwsjtnZF8hoJ8PlNV_Q5f4PS0rRk7XOeYbCvwHqAUVyFdlQudXsKi7FatqsDBfBcxqNkR4Wi1kWCpGQGtPc3X2yjtBkZP7xvvOAzdOlWjL9VuI7s2LXk-TH_7SorEqKnEAIOFVD6wYLGJ0vbU-EAG3b1lAmGsPQPRNqbgrIic1ll4DEurKs76X_-Jcq4dZiRx-X2gMJ4lefU4aaBKkIyUiYdNSRtgZSN_V6J68ZzcU2UO-_PlQX8vgE7z0vRdM1wmJQIdXpQDL4PRmjpvKl_tg',
        # rubocop:enable Layout/LineLength
        'token' => 'bb7cb707-f405-43af-9f7e-b151846fd92b',
        'refresh_token' => nil,
        'expires_in' => '120',
        'scope' => nil
      },
      'extra' => {
        'raw_info' => {
          'nonce' => 'bf5811df0cbf392754ca252a29c0cc36',
          'identityscheme' => 'dkmitid',
          'authenticationtype' => 'urn:grn:authn:dk:mitid:substantial',
          'authenticationmethod' =>
          'app:1692621888956:SUBSTANTIAL:SUBSTANTIAL:HIGH:HIGH',
          'authenticationinstant' => '2023-08-21T12:45:01.733Z',
          'nameidentifier' => '29d14ea06e16473286ac5de87a941784',
          'sub' => '{29d14ea0-6e16-4732-86ac-5de87a941784}',
          'sessionindex' => '531690ce-9792-4949-8a11-f3f5a4c504b5',
          'loA' => 'SUBSTANTIAL',
          'ial' => 'SUBSTANTIAL',
          'aal' => 'SUBSTANTIAL',
          'fal' => 'HIGH',
          'uuid' => '410a77ec-4f85-46e4-aaef-bdbbd1a951f2',
          'cprNumberIdentifier' => '3112772846',
          'birthdate' => '1977-12-31',
          'dateofbirth' => '1977-12-31',
          'age' => '45',
          'name' => 'Bulenga Poulsen',
          'refTextHeader' => 'Log on at Criipto',
          'refTextBody' => 'local development test (Koen)',
          'country' => 'DK',
          'iss' => 'https://kobenhavn-test.criipto.id',
          'aud' => 'urn:my:application:identifier:407793',
          'iat' => 1_692_621_902,
          'nbf' => 1_692_621_902,
          'exp' => 1_692_639_888,
          'address' => {
            'formatted' => "Paiman Petersen\nGrusgraven 1,3 tv\n3400 Hillerød\n(Lokalitet ukendt)\nDanmark",
            'common_name' => 'Paiman Petersen',
            'street_address' => 'Grusgraven 1,3 tv',
            'postal_code' => '3400',
            'city' => 'Hillerød',
            'locality' => '(Lokalitet ukendt)',
            'region' => nil,
            'country' => 'Danmark'
          },
          'address_details' => {
            'road' => 'Grusgraven',
            'road_code' => '1732',
            'municipality' => 'Lyngby-Taarbæk',
            'municipality_code' => '0173',
            'house_number' => '001',
            'floor' => '03',
            'apartment_code' => ' tv'
          }
        }
      }
    }
  end

  before do
    @user = create(:user, first_name: 'Bulenga', last_name: 'Poulsen')
    @token = AuthToken::AuthToken.new(payload: @user.to_token_payload).token

    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:criipto] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'criipto',
        identity_source: 'DK MitID',
        domain: 'some.test.domain.com',
        client_id: '12345',
        client_secret: '78910',
        birthday_custom_field_key: 'birthdate',
        birthyear_custom_field_key: 'birthyear',
        municipality_code_custom_field_key: 'municipality_code',
        postal_code_custom_field_key: 'postal_code',
        ui_method_name: 'MitID'
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_user_to_be_verified(user)
    expect(user.reload).to have_attributes({
      verified: true,
      first_name: 'Bulenga',
      last_name: 'Poulsen',
      custom_field_values: {
        'birthdate' => '1977-12-31',
        'birthyear' => 1977,
        'municipality_code' => '0173',
        'postal_code' => '3400'
      }
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'DK MitID',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, '410a77ec-4f85-46e4-aaef-bdbbd1a951f2', 'DK MitID')
    })
  end

  def expect_user_to_be_verified_and_identified(user)
    expect_user_to_be_verified(user)
    expect(user.identities.first).to have_attributes({
      provider: 'criipto',
      user_id: user.id,
      uid: '410a77ec-4f85-46e4-aaef-bdbbd1a951f2',
      auth_hash: nil
    })
  end

  it 'successfully verifies a user' do
    get "/auth/criipto?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
    follow_redirect!

    expect_user_to_be_verified(@user)

    expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')
  end

  it 'successfully authenticates a user that was previously verified' do
    get "/auth/criipto?token=#{@token}"
    follow_redirect!

    expect(User.count).to eq(1)
    expect(@user.identities.count).to eq(0)
    expect_user_to_be_verified(@user)

    get '/auth/criipto'
    follow_redirect!

    expect(User.count).to eq(1)
    expect(@user.identities.count).to eq(1)
    expect_user_to_be_verified_and_identified(@user)
  end

  context 'updating custom fields when existing user' do
    before do
      auth_hash['extra']['raw_info']['birthdate'] = '1978-01-01'
      auth_hash['extra']['raw_info']['address_details']['municipality_code'] = '0666'
      auth_hash['extra']['raw_info']['address']['postal_code'] = '3500'
      OmniAuth.config.mock_auth[:criipto] = OmniAuth::AuthHash.new(auth_hash)
      @user.update!(verified: true, custom_field_values: { 'birthdate' => '1902-12-25', 'birthyear' => 1902, 'municipality_code' => '0123', 'postal_code' => '1234' })
    end

    it 'updates custom fields when reverifying' do
      get "/auth/criipto?token=#{@token}"
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.reload.identities.count).to eq(0)
      expect(@user.reload.verified).to be true
      expect(@user.reload.custom_field_values).to eq({ 'birthdate' => '1978-01-01', 'birthyear' => 1978, 'municipality_code' => '0666', 'postal_code' => '3500' })
    end

    it 'updates custom fields when authenticating as an existing user' do
      create(:identity, provider: 'criipto', uid: '410a77ec-4f85-46e4-aaef-bdbbd1a951f2', user: @user)

      get '/auth/criipto'
      follow_redirect!

      expect(User.count).to eq(1)
      expect(@user.reload.verified).to be true
      expect(@user.reload.identities.count).to eq(1)
      expect(@user.reload.custom_field_values).to eq({ 'birthdate' => '1978-01-01', 'birthyear' => 1978, 'municipality_code' => '0666', 'postal_code' => '3500' })
    end
  end

  it 'successfully verifies another user with another MitID account' do
    get "/auth/criipto?token=#{@token}"
    follow_redirect!
    expect(@user.reload).to have_attributes({
      verified: true
    })

    user2 = create(:user)
    token2 = AuthToken::AuthToken.new(payload: user2.to_token_payload).token
    auth_hash['extra']['raw_info']['uuid'] = '12345'
    OmniAuth.config.mock_auth[:criipto] = OmniAuth::AuthHash.new(auth_hash)

    get "/auth/criipto?token=#{token2}"
    follow_redirect!
    expect(user2.reload).to have_attributes(verified: true)
  end

  it 'fails when uid has already been used' do
    uid = '410a77ec-4f85-46e4-aaef-bdbbd1a951f2'
    create(
      :verification,
      method_name: 'DK MitID',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, uid, 'DK MitID')
    )

    get "/auth/criipto?token=#{@token}"
    follow_redirect!

    expect(@user.reload).to have_attributes(verified: false)
  end

  it 'creates user when the authentication token is not passed' do
    expect(User.count).to eq(1)
    get '/auth/criipto?param=some-param'
    follow_redirect!

    expect(User.count).to eq(2)

    user = User.order(created_at: :asc).last
    expect_user_to_be_verified_and_identified(user)

    expect(user).not_to eq(@user)
    expect(user).to have_attributes({
      email: nil,
      password_digest: nil
    })

    expect(response).to redirect_to('/en/?param=some-param&sso_flow=signup&sso_success=true')
  end

  it 'does not send email to empty address (when just registered)' do
    get '/auth/criipto'
    follow_redirect!

    expect(ActionMailer::Base.deliveries).to be_empty
  end

  context 'when verification is already taken by new user' do
    before do
      get '/auth/criipto'
      follow_redirect!
    end

    let!(:new_user) do
      User.order(created_at: :asc).last.tap do |user|
        expect(user).to have_attributes({ email: nil })
        expect_user_to_be_verified_and_identified(user)
      end
    end

    context 'when verified registration is completed by new user' do
      before { new_user.update!(email: Faker::Internet.email) }

      it 'does not verify another user and does not delete previously verified new user' do
        get "/auth/criipto?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
        expect(@user.reload).to have_attributes({
          verified: false,
          first_name: 'Bulenga',
          last_name: 'Poulsen'
        })

        expect(new_user.reload).to eq(new_user)
      end
    end

    context 'when verified registration is not completed by new user' do
      it 'successfully verifies another user and deletes previously verified blank new user' do
        get "/auth/criipto?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/en/some-page?verification_success=true')
        expect_user_to_be_verified(@user.reload)
        expect { new_user.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'update email after registration with Criipto' do
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
      before do
        configuration = AppConfiguration.instance
        configuration.settings['user_confirmation'] = {
          'enabled' => true,
          'allowed' => true
        }
        configuration.save!
      end

      it 'creates user that can add & confirm her email' do
        get '/auth/criipto'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)
        expect(user.email).to be_nil
        expect(user.active?).to be(true)
        expect(ActionMailer::Base.deliveries.count).to eq(0)

        headers = { 'Authorization' => authorization_header(user) }

        patch "/web_api/v1/users/#{user.id}", params: { user: { email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(true)
        expect(user.active?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(1)

        post '/web_api/v1/user/confirm', params: { confirmation: { code: user.email_confirmation_code } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
        expect(user).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.new_email).to be_nil
      end

      it 'allows users to be active without adding an email & confirmation' do
        get '/auth/criipto'
        follow_redirect!

        get '/auth/criipto'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)
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

        create(:custom_field, key: 'birthdate')
        create(:custom_field, key: 'birthyear', input_type: 'number')
        create(:custom_field, key: 'municipality_code')
      end

      it 'creates user that can update her email' do
        get '/auth/criipto'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)

        token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
        headers = { 'Authorization' => "Bearer #{token}" }
        patch "/web_api/v1/users/#{user.id}", params: { user: { email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(false)
      end
    end
  end

  context 'when configured for auth0 backward compatibility' do
    before do
      config = AppConfiguration.instance
      criipto = config.settings('verification', 'verification_methods').first
      criipto[:method_name_for_hashing] = 'auth0'
      criipto[:uid_field_pattern] = 'adfs|cl-test-criipto-verify-DK-NemID-POCES|%{nameidentifier}'
      config.save!
    end

    it 'successfully verifies a user like auth0' do
      get "/auth/criipto?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
      follow_redirect!

      expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')

      expect(@user.reload).to have_attributes(verified: true)
      expect(@user.custom_field_values['birthdate']).to eq '1977-12-31'
      expect(@user.verifications.first).to have_attributes({
        method_name: 'auth0',
        user_id: @user.id,
        active: true
      })
      hash_value = Verification::VerificationService.new.send(:hashed_uid, 'adfs|cl-test-criipto-verify-DK-NemID-POCES|29d14ea06e16473286ac5de87a941784', 'auth0')
      expect(@user.verifications.first.hashed_uid).to eq(hash_value)
      expect(@user.verifications.first.hashed_uid).to eq('106ba51c378a87edd55f322f0c4c9ae7ba4f6ef9141aeec0fc1ebef68d01f128')
    end
  end
end
