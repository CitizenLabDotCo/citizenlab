# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'criipto verification' do
  let(:user) { create(:user, first_name: 'Rudolphi', last_name: 'Raindeari') }
  let(:token) { AuthToken::AuthToken.new(payload: user.to_token_payload).token }

  let(:auth_hash) do
    {
      'provider' => 'criipto',
      'uid' => '{29d14ea0-6e16-4732-86ac-5de87a941784}',
      'info' =>
        { 'name' => 'Bulenga Poulsen',
          'email' => nil,
          'email_verified' => nil,
          'nickname' => nil,
          'first_name' => nil,
          'last_name' => nil,
          'gender' => nil,
          'image' => nil,
          'phone' => nil,
          'urls' => { 'website' => nil } },
      'credentials' =>
        { 'id_token' =>
          # rubocop:disable Layout/LineLength
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjhCREY3OUEzRkY5OTdFQTg1QjYyRjk1OUQzRDdCMzdFRDAyMjhFOTAifQ.eyJpc3MiOiJodHRwczovL2tvYmVuaGF2bi10ZXN0LmNyaWlwdG8uaWQiLCJhdWQiOiJ1cm46bXk6YXBwbGljYXRpb246aWRlbnRpZmllcjo0MDc3OTMiLCJub25jZSI6ImJmNTgxMWRmMGNiZjM5Mjc1NGNhMjUyYTI5YzBjYzM2IiwiaWRlbnRpdHlzY2hlbWUiOiJka21pdGlkIiwiYXV0aGVudGljYXRpb250eXBlIjoidXJuOmdybjphdXRobjpkazptaXRpZDpzdWJzdGFudGlhbCIsImF1dGhlbnRpY2F0aW9ubWV0aG9kIjoiYXBwOjE2OTI2MjE4ODg5NTY6U1VCU1RBTlRJQUw6U1VCU1RBTlRJQUw6SElHSDpISUdIIiwiYXV0aGVudGljYXRpb25pbnN0YW50IjoiMjAyMy0wOC0yMVQxMjo0NTowMS43MzNaIiwibmFtZWlkZW50aWZpZXIiOiIyOWQxNGVhMDZlMTY0NzMyODZhYzVkZTg3YTk0MTc4NCIsInN1YiI6InsyOWQxNGVhMC02ZTE2LTQ3MzItODZhYy01ZGU4N2E5NDE3ODR9Iiwic2Vzc2lvbmluZGV4IjoiNTMxNjkwY2UtOTc5Mi00OTQ5LThhMTEtZjNmNWE0YzUwNGI1IiwibG9BIjoiU1VCU1RBTlRJQUwiLCJpYWwiOiJTVUJTVEFOVElBTCIsImFhbCI6IlNVQlNUQU5USUFMIiwiZmFsIjoiSElHSCIsInV1aWQiOiI0MTBhNzdlYy00Zjg1LTQ2ZTQtYWFlZi1iZGJiZDFhOTUxZjIiLCJjcHJOdW1iZXJJZGVudGlmaWVyIjoiMzExMjc3Mjg0NiIsImJpcnRoZGF0ZSI6IjE5NzctMTItMzEiLCJkYXRlb2ZiaXJ0aCI6IjE5NzctMTItMzEiLCJhZ2UiOiI0NSIsIm5hbWUiOiJCdWxlbmdhIFBvdWxzZW4iLCJyZWZUZXh0SGVhZGVyIjoiTG9nIG9uIGF0IENyaWlwdG8iLCJyZWZUZXh0Qm9keSI6ImxvY2FsIGRldmVsb3BtZW50IHRlc3QgKEtvZW4pIiwiY291bnRyeSI6IkRLIiwiaWF0IjoxNjkyNjIxOTAyLCJuYmYiOjE2OTI2MjE5MDIsImV4cCI6MTY5MjYzOTg4OH0.1dMJe80vvEFt4EFIF2kd_Tdy5UPEEw3qGjjVuNYHhw1Oonxpjtpjm1t-Q8YiMUZ_zwsjtnZF8hoJ8PlNV_Q5f4PS0rRk7XOeYbCvwHqAUVyFdlQudXsKi7FatqsDBfBcxqNkR4Wi1kWCpGQGtPc3X2yjtBkZP7xvvOAzdOlWjL9VuI7s2LXk-TH_7SorEqKnEAIOFVD6wYLGJ0vbU-EAG3b1lAmGsPQPRNqbgrIic1ll4DEurKs76X_-Jcq4dZiRx-X2gMJ4lefU4aaBKkIyUiYdNSRtgZSN_V6J68ZzcU2UO-_PlQX8vgE7z0vRdM1wmJQIdXpQDL4PRmjpvKl_tg',
          # rubocop:enable Layout/LineLength
          'token' => 'bb7cb707-f405-43af-9f7e-b151846fd92b',
          'refresh_token' => nil,
          'expires_in' => '120',
          'scope' => nil },
      'extra' =>
        { 'raw_info' =>
          { 'nonce' => 'bf5811df0cbf392754ca252a29c0cc36',
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
            address: {
              formatted: "Paiman Petersen\nGrusgraven 1,3 tv\n3400 Hillerød\n(Lokalitet ukendt)\nDanmark",
              common_name: 'Paiman Petersen',
              street_address: 'Grusgraven 1,3 tv',
              postal_code: '3400',
              city: 'Hillerød',
              locality: '(Lokalitet ukendt)',
              region: nil,
              country: 'Danmark'
            },
            address_details: {
              road: 'Grusgraven',
              road_code: '1732',
              municipality: 'Lyngby-Taarbæk',
              municipality_code: '0173',
              house_number: '001',
              floor: '03',
              apartment_code: ' tv'
            } } }
    }
  end

  before do
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
        method_name_multiloc: {
          en: 'MitID Verification'
        },
        uid_field_pattern: '%{sub}'
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  it 'successfully verifies a user' do
    get "/auth/criipto?token=#{token}&random-passthrough-param=somevalue&pathname=/yipie"
    follow_redirect!

    expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')

    expect(user.reload).to have_attributes(verified: true)
    expect(user.custom_field_values['municipality_code']).to eq '0173'
    expect(user.custom_field_values['birthyear']).to eq 1977
    expect(user.custom_field_values['birthdate']).to eq '1977-12-31'
    expect(user.verifications.first).to have_attributes({
      method_name: 'criipto',
      user_id: user.id,
      active: true
    })
    hash_value = Verification::VerificationService.new.send(:hashed_uid, '{29d14ea0-6e16-4732-86ac-5de87a941784}', 'criipto')
    expect(user.verifications.first.hashed_uid).to eq(hash_value)
    expect(user.verifications.first.hashed_uid).to eq('d006d4bf453dcd6abf792b0a18f330796a715bdf19315c2c1db8714371bcb025')
  end

  it 'successfully verifies another user with another MitID account' do
    get "/auth/criipto?token=#{token}"
    follow_redirect!
    expect(user.reload).to have_attributes({
      verified: true
    })

    user2 = create(:user)
    token2 = AuthToken::AuthToken.new(payload: user2.to_token_payload).token
    auth_hash['extra']['raw_info']['sub'] = '12345'
    OmniAuth.config.mock_auth[:criipto] = OmniAuth::AuthHash.new(auth_hash)

    get "/auth/criipto?token=#{token2}"
    follow_redirect!
    expect(user2.reload).to have_attributes(verified: true)
  end

  it 'fails when uid has already been used' do
    uid = '{29d14ea0-6e16-4732-86ac-5de87a941784}'
    create(
      :verification,
      method_name: 'criipto',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, uid, 'criipto')
    )

    get "/auth/criipto?token=#{token}"
    follow_redirect!

    expect(user.reload).to have_attributes(verified: false)
  end
end
