# frozen_string_literal: true

require 'rails_helper'

# These tests are mainly intended to quickly identify issues.
# The user update/create flow is very tricky, so it's much better to test it
# by writing high-level feature specs.
describe UserService do
  let(:service) { described_class }
  let(:user_params) do
    {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'democracy2.0',
      locale: 'en'
    }
  end
  let(:confirm_user) { true }

  describe '.upsert_in_web_api' do
    it 'assigns attributes and saves the user' do
      user = User.new
      service.upsert_in_web_api(user, user_params) { true }
      expect(user.persisted?).to be(true)
    end
  end

  describe '.create_in_admin_api' do
    it 'creates a new user' do
      expect { service.create_in_admin_api(user_params, confirm_user) }.to change(User, :count).by(1)
    end
  end

  describe '.update_in_admin_api' do
    it 'updates an existing user' do
      user = User.create(user_params)
      service.update_in_admin_api(user, { first_name: 'Updated' }, confirm_user)
      expect(user.reload.first_name).to eq('Updated')
    end
  end

  describe '.build_in_sso' do
    it 'builds a new user without saving' do
      user = service.build_in_sso(user_params, confirm_user, 'en')
      expect(user.persisted?).to be false
    end

    context 'when the SSO returns an email' do
      let(:user_params) { super().merge(email: 'test@example.com') }

      context 'and the SSO says the email is verified' do
        it 'puts the email in email and confirms the user' do
          user = service.build_in_sso(user_params, true, 'en')
          expect(user.email).to eq('test@example.com')
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end
      end

      context 'and the SSO does not say the email is verified' do
        it 'puts the email in new_email and does not confirm the user' do
          user = service.build_in_sso(user_params, false, 'en')
          expect(user.email).to be_nil
          expect(user.new_email).to eq('test@example.com')
          expect(user.confirmation_required).to be true
        end
      end
    end

    context 'when the SSO does not return an email' do
      let(:user_params) { super().except(:email) }

      context 'and the SSO says the email is verified' do
        # Should not be possible
        it 'leaves the email blank and does not confirm the user' do
          user = service.build_in_sso(user_params, true, 'en')
          expect(user.email).to be_nil
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end
      end

      context 'and the SSO does not say the email is verified' do
        it 'leaves the email blank and does not confirm the user' do
          user = service.build_in_sso(user_params, false, 'en')
          expect(user.email).to be_nil
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end
      end
    end
  end

  describe '.update_in_sso!' do
    # These specs cover the full truth table of what should happen to a user's
    # email when they log in again through SSO. The relevant inputs are:
    #
    #   - whether the user already has an email
    #   - whether that existing email is confirmed
    #   - whether the SSO returns an email
    #   - whether the SSO says that email is confirmed
    #   - whether email updates are allowed (i.e. whether the authver method
    #     returns :email in `updateable_user_attrs`; in practice this is driven
    #     by the `password_login` feature flag being turned off)
    #
    # Combinations that cannot occur in practice are intentionally not tested:
    #   - "existing email confirmed" while the user has no email
    #   - "SSO email confirmed" while the SSO returns no email
    # (These should-not-occur cases will be handled separately later.)
    let(:auth) { instance_double(OmniAuth::AuthHash) }
    let(:existing_email) { 'existing@example.com' }
    let(:sso_email) { 'sso@example.com' }

    # Runs `update_in_sso!` against a doubled authver method whose behaviour is
    # configured by the table columns.
    def perform_update(user, returns_email:, email_confirmed:, allow_update_email:, sso_email: 'sso@example.com')
      updateable_user_attrs = %i[first_name]
      updateable_user_attrs << :email if allow_update_email

      profile = { first_name: 'Updated' }
      profile[:email] = sso_email if returns_email

      authver_method = instance_double(
        IdMethods::Base,
        updateable_user_attrs: updateable_user_attrs,
        profile_to_user_attrs: profile,
        email_confirmed?: email_confirmed
      )

      service.update_in_sso!(user, auth, authver_method)
    end

    context 'when the user has a confirmed email' do
      let(:user) { create(:user, email: existing_email) }

      context 'when the SSO returns an email' do
        it 'replaces the email when the SSO email is confirmed and email updates are allowed' do
          perform_update(user, returns_email: true, email_confirmed: true, allow_update_email: true)
          user.reload
          expect(user.email).to eq(sso_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end

        it 'does nothing when the SSO email is confirmed but email updates are not allowed' do
          perform_update(user, returns_email: true, email_confirmed: true, allow_update_email: false)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end

        it 'does nothing when the SSO email is not confirmed and email updates are allowed' do
          perform_update(user, returns_email: true, email_confirmed: false, allow_update_email: true)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end

        it 'does nothing when the SSO email is not confirmed and email updates are not allowed' do
          perform_update(user, returns_email: true, email_confirmed: false, allow_update_email: false)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end
      end

      context 'when the SSO does not return an email' do
        # The two "SSO email confirmed = Yes" rows cannot occur (no email was
        # returned) and are intentionally omitted.
        it 'does nothing when the SSO email is not confirmed and email updates are allowed' do
          perform_update(user, returns_email: false, email_confirmed: false, allow_update_email: true)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end

        it 'does nothing when the SSO email is not confirmed and email updates are not allowed' do
          perform_update(user, returns_email: false, email_confirmed: false, allow_update_email: false)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end
      end
    end

    context 'when the user has an unconfirmed email' do
      let(:user) { create(:unconfirmed_user, email: existing_email) }

      context 'when the SSO returns an email' do
        it 'replaces the email when the SSO email is confirmed and email updates are allowed' do
          perform_update(user, returns_email: true, email_confirmed: true, allow_update_email: true)
          user.reload
          expect(user.email).to eq(sso_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end

        # "Confirm email if they match, otherwise do nothing" -> two specs.
        context 'when the SSO email is confirmed but email updates are not allowed' do
          it 'confirms the existing email when the SSO email matches it' do
            perform_update(user, returns_email: true, email_confirmed: true, allow_update_email: false, sso_email: existing_email)
            user.reload
            expect(user.email).to eq(existing_email)
            expect(user.new_email).to be_nil
            expect(user.confirmation_required).to be false
          end

          it 'does nothing when the SSO email does not match the existing email' do
            perform_update(user, returns_email: true, email_confirmed: true, allow_update_email: false, sso_email: sso_email)
            user.reload
            expect(user.email).to eq(existing_email)
            expect(user.new_email).to be_nil
            expect(user.confirmation_required).to be true
          end
        end

        it 'leaves the email and stores the SSO email as new_email when the SSO email is not confirmed and email updates are allowed' do
          perform_update(user, returns_email: true, email_confirmed: false, allow_update_email: true)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to eq(sso_email)
          expect(user.confirmation_required).to be true
        end

        it 'does nothing when the SSO email is not confirmed and email updates are not allowed' do
          perform_update(user, returns_email: true, email_confirmed: false, allow_update_email: false)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end
      end

      context 'when the SSO does not return an email' do
        # The two "SSO email confirmed = Yes" rows cannot occur and are omitted.
        it 'does nothing when the SSO email is not confirmed and email updates are allowed' do
          perform_update(user, returns_email: false, email_confirmed: false, allow_update_email: true)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end

        it 'does nothing when the SSO email is not confirmed and email updates are not allowed' do
          perform_update(user, returns_email: false, email_confirmed: false, allow_update_email: false)
          user.reload
          expect(user.email).to eq(existing_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end
      end
    end

    context 'when the user does not have an email' do
      # A user without an email can only be in the "email not confirmed" state,
      # so the eight "existing email confirmed = Yes" rows cannot occur.
      let(:user) do
        user = build(:unconfirmed_user, email: nil)
        user.identities.build(provider: 'fake_sso', uid: 'sso-uid', auth_hash: {})
        user.save!
        user
      end

      context 'when the SSO returns an email' do
        it 'sets the email when the SSO email is confirmed and email updates are allowed' do
          perform_update(user, returns_email: true, email_confirmed: true, allow_update_email: true)
          user.reload
          expect(user.email).to eq(sso_email)
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be false
        end

        it 'does nothing when the SSO email is confirmed but email updates are not allowed' do
          perform_update(user, returns_email: true, email_confirmed: true, allow_update_email: false)
          user.reload
          expect(user.email).to be_nil
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end

        it 'stores the SSO email as new_email when the SSO email is not confirmed and email updates are allowed' do
          perform_update(user, returns_email: true, email_confirmed: false, allow_update_email: true)
          user.reload
          expect(user.email).to be_nil
          expect(user.new_email).to eq(sso_email)
          expect(user.confirmation_required).to be true
        end

        it 'does nothing when the SSO email is not confirmed and email updates are not allowed' do
          perform_update(user, returns_email: true, email_confirmed: false, allow_update_email: false)
          user.reload
          expect(user.email).to be_nil
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end
      end

      context 'when the SSO does not return an email' do
        # The two "SSO email confirmed = Yes" rows cannot occur and are omitted.
        it 'does nothing when the SSO email is not confirmed and email updates are allowed' do
          perform_update(user, returns_email: false, email_confirmed: false, allow_update_email: true)
          user.reload
          expect(user.email).to be_nil
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end

        it 'does nothing when the SSO email is not confirmed and email updates are not allowed' do
          perform_update(user, returns_email: false, email_confirmed: false, allow_update_email: false)
          user.reload
          expect(user.email).to be_nil
          expect(user.new_email).to be_nil
          expect(user.confirmation_required).to be true
        end
      end
    end
  end

  describe '.assign_params_in_accept_invite' do
    it 'assigns attributes and marks the invite as accepted' do
      user = User.new
      service.assign_params_in_accept_invite(user, user_params)
      expect(user.first_name).to eq 'Test'
      expect(user.invite_status).to eq 'accepted'
    end

    context 'when confirm_user is true' do
      it 'confirms the user email' do
        user = create(:invited_user)
        expect(user.confirmation_required).to be true

        service.assign_params_in_accept_invite(user, { first_name: 'Updated' }, confirm_user: true)

        user.reload
        expect(user.confirmation_required).to be false
        expect(user.email_confirmed_at).to be_present
      end
    end

    context 'when confirm_user is false' do
      it 'does not confirm the user email' do
        user = create(:invited_user)

        service.assign_params_in_accept_invite(user, { first_name: 'Updated' }, confirm_user: false)

        # Nothing is persisted (and the email is not confirmed) when confirm_user is false.
        user.reload
        expect(user.confirmation_required).to be true
        expect(user.email_confirmed_at).to be_nil
      end
    end
  end

  describe '.build_in_input_importer' do
    it 'builds a new user without saving' do
      user = service.build_in_input_importer(user_params)
      expect(user.persisted?).to be false
    end
  end

  describe '.create_in_tenant_template!' do
    it 'creates a new user' do
      expect { service.create_in_tenant_template!(user_params) }.to change(User, :count).by(1)
    end
  end

  describe '.update_in_tenant_template!' do
    it 'updates an existing user' do
      user = User.create(user_params)
      service.update_in_tenant_template!(user, { first_name: 'Updated' })
      expect(user.reload.first_name).to eq('Updated')
    end
  end
end
