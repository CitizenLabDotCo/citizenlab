# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

describe 'google authentication' do
  before do
    @user = create(:user)
    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:google] = OmniAuth::AuthHash.new(
      {
        uid: '101481246124019184774',
        info: {
          name: 'Boris Brompton',
          email: 'boris.brompton@orange.uk',
          image: 'https://lh3.googleusercontent.com/-Q2YP0Ju3enE/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcvJkuBGnWEs_vjHZDTGaRUE7RXeg/mo/s640-c/photo.jpg',
          last_name: 'Brompton',
          first_name: 'Boris'
        },
        extra: {
          id_info: {
            aud: '692484441813-damde0aem1ie69qrah6ter8gndcnf8qf.apps.googleusercontent.com',
            azp: '692484441813-damde0aem1ie69qrah6ter8gndcnf8qf.apps.googleusercontent.com',
            exp: 1_554_974_565,
            iat: 1_554_970_965,
            iss: 'https://accounts.google.com',
            sub: '101481246124019184774',
            name: 'Boris Brompton',
            email: 'boris.brompton@orange.uk',
            locale: 'nl',
            at_hash: 'fXlbED1X2DIqjmtYRu-vNg',
            picture: 'https://lh3.googleusercontent.com/-Q2YP0Ju3enE/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcvJkuBGnWEs_vjHZDTGaRUE7RXeg/s96-c/photo.jpg',
            given_name: 'Boris',
            family_name: 'Brompton',
            email_verified: true
          },
          id_token: 'eyJhbGciOiJSUzI1NiJsImtpZCI6IjZmNjc4MRJhNzEbOTlhNjU4ZTc2MGFhNWFhOTNlNWZjM2RjNzUyYjUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI2OTI0ODQ0NDE4MTMtZGFtZGUwYWVtMWllNjlxcmFoNnRlcjhnbmRjbmY4cWYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2OTI0ODQ0NDE4MTMtZGFtZGUwYWVtMWllNjlxcmFoNnRlcjhnbmRjbmY4cWYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDE0ODE5NDYxMjQwMzkxODQ2NzQiLCJlbWFpbCI6ImZyYW5rLnZhbmRyb29nZW5icm9lY2tAb3V0bG9vay5iZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiZlhsYkVEMVgyRElxam10WVJ1LXZOZyIsIm5hbWUiOiJGcmFuayBWYW4gRHJvb2dlbmJyb2VjayIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vLVEyWVAwSnUzZW5FL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FDSGkzcmN2Smt1QkduV0VzX3ZqSFpEVEdhUlVFN1JYZWcvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkZyYW5rIiwiZmFtaWx5X25hbWUiOiJWYW4gRHJvb2dlbmJyb2VjayIsImxvY2FsZSI6Im5sIiwiaWF0IjoxNTU0OTcwOTY1LCJleHAiOjE1NTQ5NzQ1NjV9.JPl32XIxUMGj9aS8_Z4rKgWPx-f-jHf0KbinTUZh7OmpO9k5AAXTqw_qeA79vaZiyxfn24RFbYb-F4Wvnp1qnHGlMRkGFRhtYR474v1XoN1a9y8WYXsHclyP3beWmLSUmHzMrkme5hkK3Ejc7Fj0EaAjDpufmublpqQLXl8FRXU0Q9iDtceX6owU-LJDvfXeCmEuOrIE4psTY0Vtv4iPLiQWTaRVa_9QGJpxZQMqNyyDfyZerzwAHpfx3YMCqj5Tj3OUa-KrTgWAFrY3jUijdehwLQRwMlGpVUPGt7_dZsGxis3ZClWxO1h-IRzhVwvpMSnjycZl3GV9y2mgt9xSpw',
          raw_info: {
            sub: '101484246124019184771',
            name: 'Boris Brompton',
            email: 'boris.brompton@orange.uk',
            locale: 'nl',
            picture: 'https://lh3.googleusercontent.com/-Q2YP0Ju3enE/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rcvJkuBGnWEs_vjHZDTGaRUE7RXeg/mo/photo.jpg',
            given_name: 'Boris',
            family_name: 'Brompton',
            email_verified: true
          }
        },
        provider: 'google',
        credentials: {
          token: 'ya29.GlvoBoFQ1Hzd2xDSy5H5fZpykwWguItavY6nElrAhIB40raBLaZmObqDd05OgpX6Fs9sV-b7HwYkB1SsJ2S7GTUYtPN4L5ROB2SDLPqHD_wksdpkLL_yhmZ-meZf',
          expires: true,
          expires_at: 1_554_974_565,
          refresh_token: '1/-1DuyZsL4w0Y6z-H27i_ZEItpnz0y_58HiUS6VRlvVM'
        }
      }
    )
    stub_request(:any, %r{.*/photo.jpg})
      .to_return(
        status: 200,
        body: ->(_request) { File.new(Rails.root.join('spec/fixtures/female_avatar_2.jpg')) }
      )

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['google_login'] = {
      allowed: true,
      enabled: true,
      client_id: 'fakeclientid',
      client_secret: 'fakeclientsecret'
    }
    configuration.save!
    host! 'example.org'
  end

  it 'successfully authenticates an existing user' do
    user = create(:user, email: 'boris.brompton@orange.uk')

    get '/auth/google?random-passthrough-param=somevalue'
    follow_redirect!

    expect(response).to redirect_to('/en?random-passthrough-param=somevalue')

    expect(user.reload).to have_attributes({
      first_name: user.first_name,
      last_name: user.last_name,
      email: 'boris.brompton@orange.uk',
      locale: user.locale
    })
    expect(user.identities.first).to have_attributes({
      provider: 'google',
      user_id: user.id
    })
    expect(cookies[:cl2_jwt]).to be_present
  end

  it 'does not update the avatar when re-authenticating an existing user with an avatar' do
    user = create(
      :user,
      email: 'boris.brompton@orange.uk',
      avatar: nil
    )

    get '/auth/google'
    follow_redirect!

    expect(user.reload.avatar.file.file).to be_present
  end

  it 'deletes the previous user if unverified with password and verification is enabled' do
    SettingsService.new.activate_feature! 'user_confirmation'
    user = create(:user, email: 'boris.brompton@orange.uk', password: 'supersecret')
    user.update_columns(confirmation_required: true, email_confirmed_at: nil)
    user_id = user.id

    get '/auth/google?random-passthrough-param=somevalue'
    follow_redirect!

    expect(User.exists?(user_id)).to be false
  end

  it 'clears the password if verification is disabled' do
    SettingsService.new.deactivate_feature! 'user_confirmation'
    user = create(:user, email: 'boris.brompton@orange.uk', password: 'supersecret')

    get '/auth/google?random-passthrough-param=somevalue'
    follow_redirect!

    expect(user.reload.authenticate('supersecret')).to be false
  end

  it 'updates the avatar when re-authenticating an existing user without an avatar' do
    user = create(
      :user,
      email: 'boris.brompton@orange.uk',
      avatar: Pathname.new(Rails.root.join('spec/fixtures/female_avatar_3.jpg')).open
    )
    original_file = user.avatar.file.file

    get '/auth/google'
    follow_redirect!

    expect(user.reload.avatar.file.file).to eq original_file
  end

  describe 'When registering a new user' do
    it 'successfully registers a new user' do
      get '/auth/google?random-passthrough-param=somevalue'
      follow_redirect!

      # Expect the redirect URL to include the locale ('nl-NL') from Tenant locales that includes
      # the locale code in the mock omniauth response ('nl')
      expect(response).to redirect_to('/nl-NL/complete-signup?random-passthrough-param=somevalue')

      user = User.find_by(email: 'boris.brompton@orange.uk')

      expect(user).to have_attributes({
        first_name: 'Boris',
        last_name: 'Brompton',
        email: 'boris.brompton@orange.uk',
        locale: 'nl-NL'
      })
      expect(user.identities.first).to have_attributes({
        provider: 'google',
        user_id: user.id
      })
      expect(cookies[:cl2_jwt]).to be_present
    end

    it 'uses previously selected locale appropriately' do
      get '/auth/google?sso_pathname=/fr-FR/some-page'
      follow_redirect!

      # Expect the redirect URL to include the locale ('fr-FR') of the previously selected locale,
      # which should be preferred over any locale deduced from the locale in the omniauth response ('nl')
      # Note: '%2F' is the URL-safe encoding of an ASCII '/' character
      expect(response).to redirect_to('/fr-FR/complete-signup?sso_pathname=%2Ffr-FR%2Fsome-page')

      user = User.find_by(email: 'boris.brompton@orange.uk')

      expect(user).to have_attributes({
        locale: 'fr-FR'
      })
    end

    it 'uses omniauth locale appropriately if selected locale is default' do
      get '/auth/google?sso_pathname=/en/some-page'
      follow_redirect!

      # Expect the redirect URL to include the locale ('nl-NL') from Tenant locales that includes
      # the locale code in the mock omniauth response ('nl')
      # Because the 'selected' locale is the default, we cannot be sure anything was actively selected.
      expect(response).to redirect_to('/nl-NL/complete-signup?sso_pathname=%2Fen%2Fsome-page')

      user = User.find_by(email: 'boris.brompton@orange.uk')

      expect(user).to have_attributes({
        locale: 'nl-NL'
      })
    end
  end

  it 'successfully registers an invitee' do
    user = create(:invited_user, email: 'boris.brompton@orange.uk')

    get '/auth/google?random-passthrough-param=somevalue'
    follow_redirect!

    # Expect the redirect url to include the locale ('nl-NL') from Tenant locales that includes
    # the locale code in the mock omniauth response ('nl')
    expect(response).to redirect_to('/nl-NL/complete-signup?random-passthrough-param=somevalue')

    expect(user.reload).to have_attributes({
      first_name: 'Boris',
      last_name: 'Brompton',
      email: 'boris.brompton@orange.uk',
      locale: 'nl-NL',
      invite_status: 'accepted'
    })
    expect(user.identities.first).to have_attributes({
      provider: 'google',
      user_id: user.id
    })
    expect(cookies[:cl2_jwt]).to be_present
  end
end
