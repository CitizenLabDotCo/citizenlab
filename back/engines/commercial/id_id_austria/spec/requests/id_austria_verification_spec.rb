# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

context 'id_austria verification' do
  let(:user_bpk) { 'OI:GyevPYIgD8Kobm75nD3sTRJlDNc=' } # The bPK is the unique identified for a user in ID Austria
  let(:auth_hash) do
    {
      'provider' => 'id_austria',
      'uid' => 'RB64P3VMAPKD2S34D7HPMHHWO4BB7OEJ',
      'info' =>
        { 'name' => nil,
          'email' => nil,
          'email_verified' => nil,
          'nickname' => nil,
          'first_name' => 'Otto',
          'last_name' => 'Ottakringer',
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
            { 'at_hash' => 'wRw4CZEwRrHwVEHwFucjQQ',
              'sub' => 'RB64P3VMAPKD2S34D7HPMHHWO4BB7OEJ',
              'birthdate' => '1983-01-01',
              'urn:pvpgvat:oidc.eid_ccs_url' => 'https://service.a-trust.at/securitylayer2',
              'urn:pvpgvat:oidc.pvp_version' => '2.2',
              'urn:pvpgvat:oidc.eid_citizen_qaa_eidas_level' => 'http://eidas.europa.eu/LoA/high',
              'urn:pvpgvat:oidc.eid_online_identity_link' =>
               # rubocop:disable Layout/LineLength
               'eyJ4NWMiOlsiTUlJRlFqQ0NBeXFnQXdJQkFnSUVYMjJpUWpBTkJna3Foa2lHOXcwQkFRMEZBREJqTVFzd0NRWURWUVFHRXdKQlZERW5NQ1VHQTFVRUNoTWVRblZ1WkdWemJXbHVhWE4wWlhKcGRXMGdablZsY2lCSmJtNWxjbVZ6TVJNd0VRWURWUVFMRXdwQ1RVa2dTVll2TWk5RE1SWXdGQVlEVlFRRERBMVRXbEpmVTJsbmJsOVFjbTlrTUI0WERUSXdNRGt5TlRBM05UUTBNbG9YRFRNNU1URXlOVEEzTlRRME1sb3dZekVMTUFrR0ExVUVCaE1DUVZReEp6QWxCZ05WQkFvVEhrSjFibVJsYzIxcGJtbHpkR1Z5YVhWdElHWjFaWElnU1c1dVpYSmxjekVUTUJFR0ExVUVDeE1LUWsxSklFbFdMekl2UXpFV01CUUdBMVVFQXd3TlUxcFNYMU5wWjI1ZlVISnZaRENDQWlJd0RRWUpLb1pJaHZjTkFRRUJCUUFEZ2dJUEFEQ0NBZ29DZ2dJQkFMUUZqdk9xejJkMFI3UzFZamZXZEdndHh2bHRxbnBQc0QrMmJBNkt2R1VzUHZiYmFHRnY5Q0pQdUtBN3dkRDRPSVoyN09vN3pSNCtwZTd4Y0s3YTNiRmpMOTVTT0dxOWR2M21sL2k5bzg5eVlJT3NkVTNZNnhreCtiN0V5UzFielltMTRad0paZlJUQlFZSnNwUHR3TVVpUGx6NkVoa3Y0d3dOLzJLZjM1RU10aFp4bTM1dEZ6UmpLZGhDZ0RuWmkwcVd5MThZc1Y3STdYSnZVZlJXVW1adm5tZXlQNkN5SnM2L0kxcmJQNlBlbXVNTzJMTm5IZk9zTHYxWEtla25wUkppYTlTbkg2ZmNaakp0V3FvbFhIQ2dzeDNFU3hoZFZxZTVBR296Z0lrdlk0UkJPUS9VbGh3L2ExbS9GNlBxMU5xTDhTalpBTmFTYkE3TlloeEVpT09jdVBFNURUL2U3K3J4RGFiWStnZlJzckRUTWxNZEErTGlUZ2REVlk2MlNoRUZUbytCSTQ0MXk0ZW13Mm5yM3J1Uis1NXdiSytKcHUzUkkvSDY4NWpwQXB3dWFVQUsvMUU3aUZuSmhkeSszR080VDNTVHlrTmdsZWJqcldYMG81dXZQS2NWZlB2M3Y4VmhXaTZKV2tSdDhTdUJ5ZW1GWXovVnAyL0R6R2c2RWhZTlpCUWZKeFNid01HZzJvNVorUWpLb1U0MWd6Qzh4alFWb2JqelFudjZIVkExdmpoWTQrcmRBdnpwN3BKS2t6cHRUNjEzMHRmZWJyZ1pPOXRON2IvT2FPbDZxajJrR3cwRlJHeVBIMktJeDN6ZWwwbnM0L3BWblo4ZUpZVmJULzYzM1loQ3ZxOFFWRDlzS0QwVlFFdi9FM1MzbjJqWE1oUzFpU2xoQnp3SkFnTUJBQUV3RFFZSktvWklodmNOQVFFTkJRQURnZ0lCQUc3VytoQjJZdHFmMDFZNVYxOW8xTXZXNm83Z09KanZReFRVSEVYdFdVTDFheTdnbXFBcHU2Qk92UG95NGNHZy9RMHJnVUJYR254UXNtMXlIWlJtNHBlOGQvSjdFVU1sV0MxNjNvUi9Gdnl4WFI3YmhEMlZHYVZIbnRtTkFrYkpITnhpTnJTZEtrRmRMOXNpT0tSaTgwVlE1SXpISVc4ZTBkbmtHbzc2N2IzTHVROWRsMms4Z0VmaEFMaWVmM3hxaDVSb0dGT2MyVkNNTG52Ync3ZGh1NVRVaGtWM0hPU1pUUURsVlhaMVZpRWVPT3dxZGJ3eFVjdnBDYUZyYjlXemtYc1NPbjlZSENUcUJDZUppYTNyNjFFOGZ0Vlc3TmUxWVZJVCtLQXl4eXJ6bGJGM2ExeXhGTDVVT1BLWklwTTg2VXFZaHEwSURYeGM2NnBCSXhpS1hiNU9wNzE4Zlc2ZE8xMnp0WjJtUEF2dXh2OHQrUW1EQyswNUt1RW51WTNzZGJBK2IzZU1EcXIzL2U4T05RY2ZSc2J3dzhjbHc5eWtXMnRkVVIwWEZqZk8zclBWRE8xT3RuVjN6cEdoOVlORnhkc09TbjNXOXVxaU1aUmV5RC9WbEQ2NUQ5RGY3MzZrc0ZveGFFM2g3cEtSWUF5MjkyL09Cd0NzUlh0YXhjcjVZRW5BbVJEZXJ5dHJKTUdzWlpPYWRPbUJPVkNUUzVVSUpaUSt5b1NJTDlkTU9CeUZoL2g2bjN3L09Ibko2OERjV09zSUY4M1NMdm9yRC80TnFjQmZPNkVPOEhXSk5YbkViWUFHVXJWczJJQUtuVzcraTJ6OTE2TkhtMWZUeXl0dXloWklzRWNQdXFwV2M0NHovcWFyQW5LTUFobkE4d0NxM2x0N092TGNRcUxuIl0sImFsZyI6IlJTNTEyIn0.eyJhdHRyaWJ1dGVzIjpbeyJoYXNoIjoiWnpoR2hTZXB0dldPbnJaZXYxMzIycWl1blU1QlAxQTNPUGRBUGpCRndVVT0iLCJoYXNoQWxnIjoiaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2IiwidXJuIjoidXJuOm9pZDoxLjIuNDAuMC4xMC4yLjEuMS4xNDkifSx7Imhhc2giOiIrQ2cyS0RGVlFwL3M3QzN4Z2hkYTVpMFdKamdBcXhUbGZWUC8xZ2ExSkJzPSIsImhhc2hBbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLCJ1cm4iOiJ1cm46b2lkOjEuMi40MC4wLjEwLjIuMS4xLjI2MS4yMCJ9LHsiaGFzaCI6ImVqVWJVNXUvY0thbFN6TThaNWl4RUJnMTAvZXpUbWtEWTJNQTQ0WGNZUmc9IiwiaGFzaEFsZyI6Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZW5jI3NoYTI1NiIsInVybiI6InVybjpvaWQ6MS4yLjQwLjAuMTAuMi4xLjEuNTUifSx7Imhhc2giOiJBSjAyeFNhcXoxSWZTMS84a1doaG9VUUx5NDI1UlFwbmxrY1Bock81RjZFPSIsImhhc2hBbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLCJ1cm4iOiJ1cm46b2lkOjIuNS40LjQyIn1dLCJpZCI6IjA5M2IxYjY5LThlYWEtNGJkZi1iZTlmLTQyMTEyMDk4YzMwNCIsInZhbGlkRnJvbSI6IjIwMjQtMTEtMDFUMjA6Mzc6NDcuMDk4WiIsInZhbGlkVG8iOiIyMDI0LTExLTAxVDIwOjM4OjQ3LjA5OFoifQ.MCxrjvBM5gIeZvtpCtPp5N-g_dy0So-1nVt-V6rdueghk5Q9bVF4gWtVy3pSZqSA6r5m-nhMS1LQGbiuBeWu8hFntQxANlropBvHmjTiSZ2ee0mC9AQzxy1QbgXgObztDnL_vd6f1jamiSczcCOxeZCyWCamb1Jt1b4svm6_jmiEvTbefH-q3f0rKeJhuUlNoDELT8tHG4lSRbcJekU_QpsDUsqzLNRWcseORuuIn0lresgbLJiSpTpxWsPH6IPylCRC2pIP9W7h-RE_c2gEF8OGxyE6vabb9H1tHM5gUryGwOHDbg6rhiDolv2s5PMhmNn2ek0PsEPnRkRqB8fmGdyFtIGVanPWw9FWj_OXAYCrXsOqyTp0-sMjL2sA5_E8KYlRXg9hNONlGaPqayarnLsAeTs0qIPIixo6Qkws9MTLOVGTVyCo0baGDOo-ReQtn7hgyXMSZX4Cm_mFp8PwnUy8e2zHKg0RQoZQD7-HUsqaUyNCxVOUXEVL3C2gQmToKYcxgawg4_ImhZ2ucZvlQk6-ceX0o6MEHUnXR2_-cumoDdkKpDDrRSPXbGg90ecHJG15fhpGoOIwx1itbFLI0via7a4Wa1I1-134XZraaFe8_rfc4ELxGHB9ywWRRV7p35mPVRz2jXpBXqWcaPw902Wji1EvM4AFcnM72ccNpWU',
              # rubocop:enable Layout/LineLength
              'iss' => 'https://eid.oesterreich.gv.at',
              'given_name' => 'Otto',
              'nonce' => 'cc21c70a72d8790c976d223d4ecb0841',
              'sid' => '_f06a1c13c02c26d473d0924f9f34829f',
              'aud' => 'https://www.example.org',
              'acr' => 'http://eidas.europa.eu/LoA/high',
              'urn:pvpgvat:oidc.eid_identity_status_level' => 'http://eid.gv.at/eID/status/testidentity',
              'auth_time' => 1_730_493_456,
              'urn:pvpgvat:oidc.bpk' => user_bpk,
              'exp' => 1_730_497_067,
              'iat' => 1_730_493_467,
              'family_name' => 'Ottakringer' } }
    }
  end

  before do
    @user = create(:user, first_name: 'Otto', last_name: 'Ottakringer')
    @token = AuthToken::AuthToken.new(payload: @user.to_token_payload).token

    OmniAuth.config.test_mode = true
    OmniAuth.config.mock_auth[:id_austria] = OmniAuth::AuthHash.new(auth_hash)

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{
        name: 'id_austria',
        client_id: '12345',
        client_secret: '78910',
        ui_method_name: 'ID Austria'
      }]
    }
    configuration.save!
    host! 'example.org'
  end

  def expect_user_to_be_verified(user, first_name: 'Otto', last_name: 'Ottakringer')
    expect(user.reload).to have_attributes({
      verified: true,
      first_name:,
      last_name:
    })
    expect(user.verifications.first).to have_attributes({
      method_name: 'id_austria',
      user_id: user.id,
      active: true,
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, user_bpk, 'id_austria')
    })
  end

  def expect_user_to_be_verified_and_identified(user, first_name: 'Otto', last_name: 'Ottakringer')
    expect_user_to_be_verified(user, first_name:, last_name:)
    expect(user.identities.first).to have_attributes({
      provider: 'id_austria',
      user_id: user.id,
      uid: user_bpk
    })
    expect(user.identities.first.auth_hash['credentials']).not_to be_present
    expect(user.identities.first.auth_hash.keys).to eq %w[uid info extra provider]
  end

  it 'successfully verifies a user' do
    get "/auth/id_austria?token=#{@token}&random-passthrough-param=somevalue&verification_pathname=/yipie"
    follow_redirect!

    expect_user_to_be_verified(@user)

    expect(response).to redirect_to('/en/yipie?random-passthrough-param=somevalue&verification_success=true')
  end

  it 'successfully authenticates a user that was previously verified' do
    get "/auth/id_austria?token=#{@token}"
    follow_redirect!

    expect(User.count).to eq(1)
    expect(@user.identities.count).to eq(0)
    expect_user_to_be_verified(@user)

    get '/auth/id_austria'
    follow_redirect!

    expect(User.count).to eq(1)
    expect(@user.identities.count).to eq(1)
    expect_user_to_be_verified_and_identified(@user)
  end

  it 'successfully verifies another user with another ID Austria account (different bPK)' do
    get "/auth/id_austria?token=#{@token}"
    follow_redirect!
    expect(@user.reload).to have_attributes({
      verified: true
    })

    user2 = create(:user)
    token2 = AuthToken::AuthToken.new(payload: user2.to_token_payload).token
    auth_hash['extra']['raw_info']['urn:pvpgvat:oidc.bpk'] = '12345'
    OmniAuth.config.mock_auth[:id_austria] = OmniAuth::AuthHash.new(auth_hash)

    get "/auth/id_austria?token=#{token2}"
    follow_redirect!
    expect(user2.reload).to have_attributes(verified: true)
  end

  it 'successfully authenticates a user that was previously authenticated and updates the stored auth_hash' do
    get '/auth/id_austria'
    follow_redirect!
    user = User.order(created_at: :asc).last
    expect_user_to_be_verified_and_identified(user)
    expect(user.identities.first.auth_hash['info']['gender']).to be_nil

    # Change the auth hash so we can check that is is updated
    auth_hash['info']['gender'] = 'female'
    OmniAuth.config.mock_auth[:id_austria] = OmniAuth::AuthHash.new(auth_hash)

    get '/auth/id_austria'
    follow_redirect!
    expect_user_to_be_verified_and_identified(user)
    expect(user.identities.first.auth_hash['info']['gender']).to eq 'female'
  end

  it 'fails when bpk has already been used' do
    create(
      :verification,
      method_name: 'id_austria',
      hashed_uid: Verification::VerificationService.new.send(:hashed_uid, user_bpk, 'id_austria')
    )

    get "/auth/id_austria?token=#{@token}"
    follow_redirect!

    expect(@user.reload).to have_attributes(verified: false)
  end

  it 'creates user when the authentication token is not passed' do
    expect(User.count).to eq(1)
    get '/auth/id_austria?param=something'
    follow_redirect!

    expect(User.count).to eq(2)

    user = User.order(created_at: :asc).last
    expect_user_to_be_verified_and_identified(user)

    expect(user).not_to eq(@user)
    expect(user).to have_attributes({
      email: nil,
      password_digest: nil
    })

    expect(response).to redirect_to('/en/?param=something&sso_flow=signup&sso_success=true')
  end

  it 'does not send email to empty address (when just registered)' do
    get '/auth/id_austria'
    follow_redirect!

    expect(ActionMailer::Base.deliveries).to be_empty
  end

  context 'when verification is already taken by new user' do
    before do
      get '/auth/id_austria'
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
        get "/auth/id_austria?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/some-page?verification_error=true&error_code=taken')
        expect(@user.reload).to have_attributes({
          verified: false,
          first_name: 'Otto',
          last_name: 'Ottakringer'
        })

        expect(new_user.reload).to eq(new_user)
      end
    end

    context 'when verified registration is not completed by new user' do
      it 'successfully verifies another user and deletes previously verified blank new user' do
        get "/auth/id_austria?token=#{@token}&verification_pathname=/some-page"
        follow_redirect!

        expect(response).to redirect_to('/en/some-page?verification_success=true')
        expect_user_to_be_verified(@user.reload)
        expect { new_user.reload }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'update email after registration with IdAustria' do
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

    # TODO: JS - User confirmation is not required - why?
    context 'email confirmation enabled' do
      before do
        configuration = AppConfiguration.instance
        configuration.settings['user_confirmation'] = {
          'enabled' => true,
          'allowed' => true
        }
        configuration.save!
      end

      it 'creates user that can add and confirm her email' do
        get '/auth/id_austria'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)

        headers = { 'Authorization' => authorization_header(user) }

        expect(user.email).to be_nil
        expect(user.active?).to be(true)
        expect(user.confirmation_required?).to be(false)
        expect(ActionMailer::Base.deliveries.count).to eq(0)

        post '/web_api/v1/user/request_code_email_change', params: { request_code: { new_email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ new_email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(true)
        expect(ActionMailer::Base.deliveries.count).to eq(1)

        post '/web_api/v1/user/confirm_code_email_change', params: { confirmation: { code: user.email_confirmation_code } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload.confirmation_required?).to be(false)
        expect(user).to have_attributes({ email: 'newcoolemail@example.org' })
      end

      it 'allows users to be active without adding an email & confirmation' do
        get '/auth/id_austria'
        follow_redirect!

        get '/auth/id_austria'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)
        expect(user.email).to be_nil
        expect(user.confirmation_required?).to be(false)
        expect(user.active?).to be(true)
      end

      it 'does not send email to empty email address (when just registered)' do
        get '/auth/id_austria'
        follow_redirect!

        expect(ActionMailer::Base.deliveries).to be_empty
      end

      it 'only takes the first name if the first name field contains multiple names' do
        auth_hash['info']['first_name'] = 'Franz Hans'
        OmniAuth.config.mock_auth[:id_austria] = OmniAuth::AuthHash.new(auth_hash)
        get '/auth/id_austria'
        follow_redirect!
        user = User.order(created_at: :asc).last
        expect(user.first_name).to eq('Franz')
        expect_user_to_be_verified_and_identified(user, first_name: 'Franz')
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
        get '/auth/id_austria'
        follow_redirect!

        user = User.order(created_at: :asc).last
        expect_user_to_be_verified_and_identified(user)

        token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
        headers = { 'Authorization' => "Bearer #{token}" }
        patch '/web_api/v1/users/update_email_unconfirmed', params: { user: { email: 'newcoolemail@example.org' } }, headers: headers
        expect(response).to have_http_status(:ok)
        expect(user.reload).to have_attributes({ email: 'newcoolemail@example.org' })
        expect(user.confirmation_required?).to be(false)
      end
    end
  end
end
