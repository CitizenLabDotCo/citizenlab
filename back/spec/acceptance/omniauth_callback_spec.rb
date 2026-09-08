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

      AppConfiguration.instance.settings['id_config'] = {
        allowed: true,
        enabled: true,
        id_methods: [{ name: 'facebook' }]
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
      AppConfiguration.instance.settings['id_config'] = {
        allowed: true,
        enabled: true,
        id_methods: [{ name: 'fake_sso' }]
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

        context 'when claim_tokens is passed as a Rack-parsed Hash (e.g. claim_tokens[0]=...)' do
          before do
            allow_any_instance_of(OmniauthCallbackController)
              .to receive(:omniauth_params)
              .and_return({ 'claim_tokens' => { '0' => claim_token.token } })
          end

          example 'still claims participation data without erroring' do
            expect(idea.author_id).to be_nil

            do_request
            assert_status(302)
            user = User.find_by(email: 'billy_fixed@example.com')
            expect(user).not_to be_nil
            expect(idea.reload.author_id).to eq(user.id)
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
    # The confirmation code email is sent through the EmailCampaigns engine via
    # DeliveryService#send_now_to_user; spy on it to assert the code was sent.
    let(:delivery_service) { instance_spy(EmailCampaigns::DeliveryService) }

    before do
      AppConfiguration.instance.settings['id_config'] = {
        allowed: true,
        enabled: true,
        id_methods: [{ name: 'fake_sso' }]
      }
      AppConfiguration.instance.save!
      OmniAuth.config.test_mode = true
      OmniAuth.config.mock_auth[:fake_sso] = get_auth_hash(email_confirmed: false)
      allow(EmailCampaigns::DeliveryService).to receive(:new).and_return(delivery_service)
    end

    after do
      OmniAuth.config.test_mode = false
    end

    get '/auth/fake_sso/callback' do
      # Only when the account could not keep the address. Otherwise this would put
      # an email in a redirect URL, and so in the access log, for nothing.
      example 'does not hand the address back when the account kept it' do
        do_request

        expect(response_headers['Location']).not_to include('sso_email')
      end

      example 'a new user is created but email is not confirmed' do
        do_request

        assert_status(302) # Redirect code
        user = User.find_by(new_email: 'billy_fixed@example.com')
        expect(user).not_to be_nil
        expect(user.confirmation_required?).to be true
        expect(user.email_confirmed_at).to be_nil
        expect(user.verified).to be true

        # Make sure confirmation email was sent
        expect(delivery_service).to have_received(:send_now_to_user)
          .with(an_instance_of(EmailCampaigns::Campaigns::NewEmailConfirmation), user, hash_including(:code)).once
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

      # The mirror of the new-account case, one step worse: parking the address on
      # new_email made update_in_sso! raise, which locked an existing user out of
      # signing in at all. They now sign in and keep the account they had.
      context 'when identity already exists and the SSO email is owned by somebody else' do
        let!(:owner) { create(:user, email: 'billy_fixed@example.com') }
        let!(:existing_user) do
          user = build(:unconfirmed_user, email: nil)
          user.identities.build(provider: 'fake_sso', uid: 'billy_fixed', auth_hash: {})
          user.save!
          user
        end

        # :email only reaches update_in_sso! when password_login is off - that is
        # what puts it in updateable_user_attrs (IdMethods::Base#updateable_user_attrs).
        before { SettingsService.new.deactivate_feature!('password_login') }

        example 'signs the user in without claiming the address' do
          do_request

          assert_status(302)
          expect(response_headers['Location']).not_to include('authentication_error=true')

          existing_user.reload
          expect(existing_user.email).to be_nil
          expect(existing_user.new_email).to be_nil
          expect(owner.reload.email).to eq 'billy_fixed@example.com'
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

      # The address cannot be parked on new_email - validate_not_duplicate_new_email
      # rejects one somebody else holds, which used to fail the whole sign-in and
      # leave nothing behind. The account is created without an email instead, so
      # the missing-data flow can ask for one; typing this same address there
      # offers the merge, which proves control of the inbox with a code - the proof
      # an unconfirmed SSO email did not provide.
      context 'when email is already taken by another confirmed user' do
        let!(:existing_user) { create(:user, email: 'billy_fixed@example.com') }

        example 'Signs the user in on a new account carrying no email' do
          do_request

          expect(response_headers['Location']).not_to include('authentication_error=true')

          created = User.where.not(id: existing_user.id).first
          expect(created).not_to be_nil
          expect(created.email).to be_nil
          expect(created.new_email).to be_nil
          expect(created.identities.pluck(:provider)).to eq ['fake_sso']
        end

        example 'Leaves the account that owns the address untouched' do
          do_request

          existing_user.reload
          expect(existing_user.email).to eq 'billy_fixed@example.com'
          expect(existing_user.identities).to be_empty
        end

        # Handed back so the missing-data form opens with the address filled in
        # rather than asking the user to retype what the provider just told us.
        example 'Hands the address back on the redirect' do
          do_request

          expect(response_headers['Location']).to include('sso_email=billy_fixed%40example.com')
        end
      end
    end
  end
end
