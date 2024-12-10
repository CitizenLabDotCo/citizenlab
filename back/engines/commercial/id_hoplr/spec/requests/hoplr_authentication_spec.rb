# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'hoplr authentication' do
  let(:auth_hash) do
    {
      'provider' => 'hoplr',
      'uid' => '817624',
      'info' => {
        'name' => 'Developer Govocal',
        'email' => 'developers+sso@citizenlab.co',
        'email_verified' => email_verified,
        'nickname' => nil,
        'first_name' => 'Developer',
        'last_name' => 'Govocal',
        'gender' => nil,
        'image' => 'https://devhoplrstorage.blob.core.windows.net/images/defaultuser.jpg',
        'phone' => nil,
        'urls' => { 'website' => nil }
      },
      'credentials' => {
        'id_token' => 'eyJhbGciOiJSUzI1NiIsImtpZCI6IlMwOEJKVlRWRUpOT0cxRlZUWlZCNTI5QkU3S1lUQ1hIRzRQV0otX0oiLCJ0eXAiOiJKV1QifQ.eyJvaV9hdV9pZCI6IjRlZTBlZWM1LTZlYzYtNDY4MS1hOTk0LTMwZjhhNmNhNTliZiIsInN1YiI6IjgxNzYyNCIsImVtYWlsIjoiZGV2ZWxvcGVycytzc29AY2l0aXplbmxhYi5jbyIsIm5hbWUiOiJEZXZlbG9wZXIgR292b2NhbCIsImdpdmVuX25hbWUiOiJEZXZlbG9wZXIiLCJmYW1pbHlfbmFtZSI6Ikdvdm9jYWwiLCJwaWN0dXJlIjoiaHR0cHM6Ly9kZXZob3BscnN0b3JhZ2UuYmxvYi5jb3JlLndpbmRvd3MubmV0L2ltYWdlcy9kZWZhdWx0dXNlci5qcGciLCJsb2NhbGUiOiJubCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiYXpwIjoibmNXOU13cFNGZ3RkaDUmS28zd0RKIiwibm9uY2UiOiJiMTE2YTc2Njg4ZGJjYmUwYzIzY2M4Yzk4ZjFmYWYyNiIsImF0X2hhc2giOiJWdTdHYTFHOHUxeVVkS192WlUycnF3Iiwib2lfdGtuX2lkIjoiMTUyZTkwZjItMmU4Zi00MTdkLWFlNmQtMTliMjcyYWE0Y2EyIiwiYXVkIjoibmNXOU13cFNGZ3RkaDUmS28zd0RKIiwiZXhwIjoxNzIxMTQ2OTcwLCJpc3MiOiJodHRwczovL3Rlc3QuaG9wbHIuY29tLyIsImlhdCI6MTcyMTE0NTc3MH0.d7rEJw347nm_7cjXLVLg5Cx_Vrf3NjiP0EDyaSa_6herybUOEP07uqICzrraYrxgLqtFlPA8B80dypfqcOHyypw9TMc96X1kVV6TZrucyhx3MkAEqrLcd38WarBV9WNKbr2SEYImD1KD4bRQetjzJNn-0KXi6hMjjXLGY0nbVC7EnbRcig4_R9sPKOE58bMlnX8pGPqlg4yI6SXnTfAY2lcspyATybH1ps0fPp3B6o20AXAW5c_jHrJMNnt9TvLI-Ozw00VUTxxj9VUJD_MR5F8KJp-J2E7w6IeeRYammZqHO4qVYtKdhxoysXfKJwt-Gq-ZkqDUqwqUULV1qFqPcA',
        'token' => 'xxx',
        'refresh_token' => nil,
        'expires_in' => 3599,
        'scope' => 'openid email profile email_verified'
      },
      'extra' => {
        'raw_info' => {
          'sub' => '817624',
          'email' => 'developers+sso@citizenlab.co',
          'family_name' => 'Govocal',
          'given_name' => 'Developer',
          'iss' => 'https://test.hoplr.com/',
          'neighbourhood' => '2133',
          'aud' => 'ncW9MxxSFxxdh5&Ko3wDJ',
          'oi_au_id' => '4ee0eec5-1234-4681-a994-30f8a6ca59bf',
          'name' => 'Developer Govocal',
          'picture' => 'https://devhoplrstorage.blob.core.windows.net/images/defaultuser.jpg',
          'locale' => 'nl',
          'email_verified' => email_verified,
          'azp' => 'ncW9MwpSFgxxx5&Ko3wDJ',
          'nonce' => 'b116a76688abcde0c23cc8c98f1faf26',
          'at_hash' => 'Vu7Ga123u1yUdK_vZU2rqw',
          'oi_tkn_id' => '152e90f2-2e8f-1234-ae6d-19b272aa4ca2',
          'exp' => 1_721_146_970,
          'iat' => 1_721_145_770
        }
      }
    }
  end

  let(:email_verified) { false }

  before do
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:hoplr] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['hoplr_login'] = {
      allowed: true,
      enabled: true,
      environment: 'test',
      client_id: 'fakeid',
      client_secret: 'fakesecret',
      neighbourhood_custom_field_key: 'neighbourhood'
    }
    configuration.save!
    host! 'example.org'
    SettingsService.new.activate_feature!('user_confirmation')
  end

  def expect_user_to_have_attributes(user)
    expect(user.identities.first).to have_attributes({
      provider: 'hoplr',
      user_id: user.id,
      uid: '817624'
    })
    expect(user).to have_attributes({
      verified: false,
      first_name: 'Developer',
      last_name: 'Govocal',
      email: 'developers+sso@citizenlab.co',
      locale: 'en',
      custom_field_values: {
        'neighbourhood' => '2133'
      }
    })
  end

  it 'successfully authenticates new user' do
    get '/auth/hoplr?random-passthrough-param=somevalue'
    follow_redirect!

    expect(response).to redirect_to('/en/?random-passthrough-param=somevalue&sso_flow=signup&sso_success=true')

    user = User.last
    expect_user_to_have_attributes(user)
    expect(cookies[:cl2_jwt]).to be_present

    expect(user.confirmation_required?).to be(true)
  end

  context 'when email is verified' do
    let(:email_verified) { true }

    it 'creates user that does not require email confirmation' do
      get '/auth/hoplr'
      follow_redirect!

      user = User.last
      expect_user_to_have_attributes(user)
      expect(user.confirmation_required?).to be(false)
    end
  end

  context 'when user already exists' do
    let!(:user) { create(:user, email: 'developers+sso@citizenlab.co') }

    it 'successfully authenticates and updates existing user' do
      get '/auth/hoplr'
      follow_redirect!

      expect_user_to_have_attributes(user.reload)
      expect(user.confirmation_required?).to be(false)
    end

    context "when existing user's email is not confirmed" do
      before { user.update_columns(confirmation_required: true) }

      context 'when email is verified' do
        let(:email_verified) { true }

        it "confirms user's email" do
          get '/auth/hoplr'
          follow_redirect!
          expect(User.last.confirmation_required?).to be(false)
        end

        context 'when SSO email is different from existing email' do
          before do
            user.update_columns(email: 'some@citizenlab.co')
            user.identities.create!(
              provider: 'hoplr',
              user_id: user.id,
              uid: '817624'
            )
          end

          it "does not confirm user's email" do
            get '/auth/hoplr'
            follow_redirect!
            expect(User.last.confirmation_required?).to be(true)
          end

          # rubocop:disable RSpec/NestedGroups
          context 'when password login is disabled (when email can be updated)' do
            before do
              SettingsService.new.deactivate_feature!('password_login')
            end

            it "confirms user's email" do
              get '/auth/hoplr'
              follow_redirect!
              expect(User.last.confirmation_required?).to be(false)
            end
          end
          # rubocop:enable RSpec/NestedGroups
        end
      end
    end
  end
end
