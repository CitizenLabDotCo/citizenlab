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
          expect(user.email_confirmed_at).to be_present
          expect(user.confirmation_required).to be false
        end
      end

      context 'and the SSO does not say the email is verified' do
        it 'puts the email in new_email and does not confirm the user' do
          user = service.build_in_sso(user_params, false, 'en')
          expect(user.email).to be_nil
          expect(user.new_email).to eq('test@example.com')
          expect(user.email_confirmed_at).to be_nil
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
          expect(user.email_confirmed_at).to be_nil
          expect(user.confirmation_required).to be true
        end
      end

      context 'and the SSO does not say the email is verified' do
        it 'leaves the email blank and does not confirm the user' do
          user = service.build_in_sso(user_params, false, 'en')
          expect(user.email).to be_nil
          expect(user.new_email).to be_nil
          expect(user.email_confirmed_at).to be_nil
          expect(user.confirmation_required).to be true
        end
      end
    end
  end

  describe '.update_in_sso!' do
    it 'updates an existing user' do
      user = User.create(user_params)
      service.update_in_sso!(user, { first_name: 'Updated' }, confirm_user)
      expect(user.reload.first_name).to eq('Updated')
    end
  end

  describe '.assign_params_in_accept_invite' do
    it 'assigns attributes to a user' do
      user = User.new
      service.assign_params_in_accept_invite(user, user_params)
      expect(user.first_name).to eq 'Test'
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
