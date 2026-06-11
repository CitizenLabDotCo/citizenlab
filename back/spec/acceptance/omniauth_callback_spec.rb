# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def get_auth_hash(email_confirmed: true)
  OmniAuth::AuthHash.new({
    provider: 'fake_sso',
    uid: 'billy_fixed',
    info: {
      name: 'Billy Fixed',
      email: 'billy_fixed@example.com',
      email_verified: email_confirmed,
      nickname: nil,
      first_name: 'Billy',
      last_name: 'Fixed',
      gender: 'male',
      image: nil,
      phone: nil,
      urls: {
        website: nil
      }
    },
    credentials: {
      id_token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJlODI0ZWQ1Ny0xN2RkLTQ3NDEtYTUxOS0wNjY0MGVmMzdmMjkiLCJzdWIiOiJiaWxseV9maXhlZCIsImF6cCI6Imdvdm9jYWxfY2xpZW50IiwiZW1haWwiOiJiaWxseV9maXhlZEBleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkJpbGx5IEZpeGVkIiwiZ2l2ZW5fbmFtZSI6IkJpbGx5IiwiZmFtaWx5X25hbWUiOiJGaXhlZCIsImdlbmRlciI6Im1hbGUiLCJiaXJ0aGRhdGUiOiIxOTgwLTAxLTAxIiwiaWF0IjoxNzU5MjQ4MTM0LCJpc3MiOiJodHRwOi8vaG9zdC5kb2NrZXIuaW50ZXJuYWwiLCJhdWQiOiJnb3ZvY2FsX2NsaWVudCIsImV4cCI6MTc1OTI1NTMzNH0.IrccEvOLjg-r0itQZ9whoWdKkthtKNnvy-P0X67hjgg',
      token: 'access_token_abc123',
      refresh_token: nil,
      expires_in: nil,
      scope: nil
    },
    extra: {
      raw_info: {
        some: 'stuff',
        uid: 'e824ed57-17dd-4741-a519-06640ef37f29',
        sub: 'billy_fixed',
        azp: 'govocal_client',
        email: 'billy_fixed@example.com',
        email_verified: email_confirmed,
        name: 'Billy Fixed',
        given_name: 'Billy',
        family_name: 'Fixed',
        gender: 'male',
        birthdate: '1980-01-01',
        iat: 1_759_248_134,
        iss: 'http://host.docker.internal',
        aud: 'govocal_client',
        exp: 1_759_255_334
      }
    }
  })
end

resource 'Omniauth Callback', document: false do
  before { header 'Content-Type', 'application/json' }

  post '/auth/failure' do
    example_request 'Redirect to failure URL' do
      assert_status(302)
      expect(response_headers['Location']).to include('authentication_error=true')
    end
  end

  context 'when the user is logged in' do
    before do
      @user = create(:user)
    end

    parameter :user_id, 'User ID', required: true

    let(:user_id) { @user.id }

    get '/auth/clave_unica/logout_data' do
      example_request 'Returns ClaveUnica redirect URL' do
        assert_status(200)
        expect(json_response_body[:url]).to start_with('https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout')
      end
    end
  end

  context 'when authenticating via OAuth' do
    before do
      @user = create(:user, email: 'facebook_user@example.com')

      AppConfiguration.instance.settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: [{ name: 'facebook' }]
      }
      AppConfiguration.instance.save!

      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:facebook] = OmniAuth::AuthHash.new({
        provider: 'facebook',
        uid: '12345',
        info: {
          email: @user.email,
          first_name: @user.first_name,
          last_name: @user.last_name
        },
        extra: {
          raw_info: {
            locale: 'en_US',
            id: '12345'
          }
        }
      })
    end

    after do
      OmniAuth.config.test_mode = false
    end

    get '/auth/facebook/callback' do
      example 'Sets auth cookie with expected headers' do
        do_request

        assert_status(302) # Redirect code

        cookie_header = response_headers['Set-Cookie']
        expect(cookie_header).to match(/cl2_jwt=[^;]+/)
        expect(cookie_header).to include('SameSite=Lax')
        expect(cookie_header.include?('Secure')).to be(false) # No HTTPS in the test environment
        expect(cookie_header).to match(/expires=.+GMT/i)
      end
    end
  end

  context 'when SSO method returns email and it is confirmed' do
    before do
      AppConfiguration.instance.settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: [{ name: 'fake_sso' }]
      }
      AppConfiguration.instance.save!
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:fake_sso] = get_auth_hash(email_confirmed: true)
    end

    after do
      OmniAuth.config.test_mode = false
    end

    get '/auth/fake_sso/callback' do
      example 'a new user is created and email is confirmed' do
        do_request

        assert_status(302) # Redirect code
        user = User.find_by(email: 'billy_fixed@example.com')
        expect(user).not_to be_nil
        expect(user.confirmation_required?).to be false
        expect(user.email_confirmed_at).to be_present
        expect(user.verified).to be true
      end

      example 'if there is a pending invite with this email: allow create account' do
        invited_user = create(:invited_user, email: 'billy_fixed@example.com')

        do_request

        assert_status(302) # Redirect code
        db_user = User.find_by(email: 'billy_fixed@example.com')
        expect(db_user.id).to eq(invited_user.id)
        expect(db_user).not_to be_nil
        expect(db_user.confirmation_required?).to be false
        expect(db_user.email_confirmed_at).to be_present
      end

      context 'with claim_tokens' do
        let!(:claim_token) { create(:claim_token) }
        let(:idea) { claim_token.item }

        before do
          allow_any_instance_of(OmniauthCallbackController)
            .to receive(:omniauth_params)
            .and_return({ 'claim_tokens' => [claim_token.token] })
        end

        example 'claims participation data immediately for new user' do
          expect(idea.author_id).to be_nil

          do_request
          assert_status(302)
          user = User.find_by(email: 'billy_fixed@example.com')
          expect(user).not_to be_nil
          expect(idea.reload.author_id).to eq(user.id)
          expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end

        context 'when existing user logs in' do
          let!(:existing_user) { create(:user, email: 'billy_fixed@example.com') }

          example 'claims participation data immediately' do
            expect(idea.author_id).to be_nil

            do_request
            assert_status(302)
            db_user = User.find_by(email: 'billy_fixed@example.com')
            expect(db_user.id).to eq(existing_user.id)
            expect(idea.reload.author_id).to eq(existing_user.id)
            expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end

        context 'when invited user accepts via SSO' do
          let!(:invited_user) { create(:invited_user, email: 'billy_fixed@example.com') }

          example 'claims participation data immediately after invite acceptance' do
            expect(idea.author_id).to be_nil

            do_request
            assert_status(302)
            db_user = User.find_by(email: 'billy_fixed@example.com')
            expect(db_user.id).to eq(invited_user.id)
            expect(idea.reload.author_id).to eq(invited_user.id)
            expect { claim_token.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end
      end

      context 'when identity already exists and user has a confirmed email different from the SSO returned one' do
        let!(:existing_user) { create(:user, email: 'existing@example.com') }
        let!(:existing_identity) { create(:identity, user: existing_user, provider: 'fake_sso', uid: 'billy_fixed') }

        example 'does not update email nor new_email' do
          expect(User.count).to eq(1) # Only the existing user
          do_request

          assert_status(302)

          # Make sure no new user was created
          expect(User.count).to eq(1)

          existing_user.reload
          expect(existing_user.email).to eq('existing@example.com')
          expect(existing_user.new_email).to be_nil
        end
      end

      context 'when identity already exists and user has an unconfirmed email different from the SSO returned one' do
        let!(:existing_user) { create(:unconfirmed_user, email: 'existing@example.com') }
        let!(:existing_identity) { create(:identity, user: existing_user, provider: 'fake_sso', uid: 'billy_fixed') }

        example 'does not update email nor new_email' do
          expect(User.count).to eq(1) # Only the existing user
          do_request

          assert_status(302)

          # Make sure no new user was created
          expect(User.count).to eq(1)

          existing_user.reload
          expect(existing_user.email).to eq('existing@example.com')
          expect(existing_user.new_email).to be_nil
        end
      end

      context 'when identity already exists and user does not have an email' do
        let!(:existing_user) do
          user = build(:unconfirmed_user, email: nil)
          user.identities.build(provider: 'fake_sso', uid: 'billy_fixed', auth_hash: {})
          user.save!
          user
        end

        example 'does not update email nor new_email' do
          expect(User.count).to eq(1) # Only the existing user
          do_request

          assert_status(302)

          # Make sure no new user was created
          expect(User.count).to eq(1)

          existing_user.reload
          expect(existing_user.email).to be_nil
          expect(existing_user.new_email).to be_nil
        end
      end
    end
  end

  context 'when SSO method returns email but it is not confirmed' do
    let(:mailer) do
      instance_double(
        NewEmailConfirmationMailer,
        send_code: instance_double(ActionMailer::MessageDelivery, deliver_now: true)
      )
    end

    before do
      AppConfiguration.instance.settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: [{ name: 'fake_sso' }]
      }
      AppConfiguration.instance.save!
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:fake_sso] = get_auth_hash(email_confirmed: false)
      allow(NewEmailConfirmationMailer).to receive(:with).and_return(mailer)
    end

    after do
      OmniAuth.config.test_mode = false
    end

    get '/auth/fake_sso/callback' do
      example 'a new user is created but email is not confirmed' do
        do_request

        assert_status(302) # Redirect code
        user = User.find_by(new_email: 'billy_fixed@example.com')
        expect(user).not_to be_nil
        expect(user.confirmation_required?).to be true
        expect(user.email_confirmed_at).to be_nil
        expect(user.verified).to be true

        # Make sure confirmation email was sent
        expect(NewEmailConfirmationMailer).to have_received(:with).with(user: user).once
      end

      example 'if there is a pending invite with this email: return error' do
        user = create(:invited_user, email: 'billy_fixed@example.com')
        do_request
        assert_status(302) # Redirect code
        expect(response_headers['Location']).to include('authentication_error=true')
        expect(user.reload.invite_status).to eq('pending')
      end

      context 'with claim_tokens' do
        let!(:claim_token) { create(:claim_token) }
        let(:idea) { claim_token.item }

        before do
          allow_any_instance_of(OmniauthCallbackController).to receive(:omniauth_params).and_return({
            'claim_tokens' => [claim_token.token]
          })
        end

        example 'marks claim tokens as pending for new user (not claimed until email confirmed)' do
          expect(idea.author_id).to be_nil

          do_request
          assert_status(302)

          user = User.find_by(new_email: 'billy_fixed@example.com')
          expect(user).not_to be_nil
          expect(user.confirmation_required?).to be true
          expect(user.email_confirmed_at).to be_nil
          expect(claim_token.reload.pending_claimer_id).to eq(user.id)
          expect(idea.reload.author_id).to be_nil # Not yet claimed
        end
      end

      context 'when identity already exists and user has a confirmed email different from the SSO returned one' do
        let!(:existing_user) { create(:user, email: 'existing@example.com') }
        let!(:existing_identity) { create(:identity, user: existing_user, provider: 'fake_sso', uid: 'billy_fixed') }

        example 'does not update email nor new_email' do
          expect(User.count).to eq(1) # Only the existing user
          do_request

          assert_status(302)

          # Make sure no new user was created
          expect(User.count).to eq(1)

          existing_user.reload
          expect(existing_user.email).to eq('existing@example.com')
          expect(existing_user.new_email).to be_nil
        end
      end

      context 'when identity already exists and user has an unconfirmed email different from the SSO returned one' do
        let!(:existing_user) { create(:unconfirmed_user, email: 'existing@example.com') }
        let!(:existing_identity) { create(:identity, user: existing_user, provider: 'fake_sso', uid: 'billy_fixed') }

        example 'does not update email nor new_email' do
          expect(User.count).to eq(1) # Only the existing user
          do_request

          assert_status(302)

          # Make sure no new user was created
          expect(User.count).to eq(1)

          existing_user.reload
          expect(existing_user.email).to eq('existing@example.com')
          expect(existing_user.new_email).to be_nil
        end
      end

      context 'when identity already exists and user does not have an email yet' do
        let!(:existing_user) do
          user = build(:unconfirmed_user, email: nil)
          user.identities.build(provider: 'fake_sso', uid: 'billy_fixed', auth_hash: {})
          user.save!
          user
        end

        example 'does not update email nor new_email' do
          expect(User.count).to eq(1) # Only the existing user
          do_request

          assert_status(302)

          # Make sure no new user was created
          expect(User.count).to eq(1)

          existing_user.reload
          expect(existing_user.email).to be_nil
          expect(existing_user.new_email).to be_nil
        end
      end

      context 'when email is already taken by another confirmed user' do
        let!(:existing_user) { create(:user, email: 'billy_fixed@example.com') }

        example 'Returns error' do
          expect(User.count).to eq(1) # Only the existing user
          do_request

          expect(response_headers['Location']).to include('authentication_error=true')
          expect(User.count).to eq(1) # Still only the existing user
          expect(User.first.identities.length).to eq(0) # No identity should be created for the existing user
        end
      end
    end
  end
end
