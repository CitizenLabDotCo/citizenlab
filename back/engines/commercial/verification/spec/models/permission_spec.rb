# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission do
  context 'verification enabled for an action' do
    before { SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] } }

    describe 'permitted_by' do
      it 'can set the verified permitted_by' do
        permission = create(:permission, :by_verified, global_custom_fields: nil)
        expect(permission.permitted_by).to eq('verified')
      end
    end

    describe 'global_custom_fields' do
      it 'is true when created for a "verified" permitted_by' do
        permission = create(:permission, :by_verified, global_custom_fields: nil)
        expect(permission.global_custom_fields).to be_truthy
      end
    end

    describe 'verification_expiry' do
      it 'can set the verification_expiry when permitted_by is "verified"' do
        permission = create(:permission, :by_verified, verification_expiry: 1.day)
        expect(permission.verification_expiry).to eq(1.day)
      end

      it 'cannot set the verification_expiry when permitted_by is not "verified"' do
        expect { create(:permission, :by_users, verification_expiry: 1.day) }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it 'does not cause a problem if set and permitted_by is changed' do
        permission = create(:permission, :by_verified, verification_expiry: 1.day)
        permission.update!(permitted_by: 'users')
        expect(permission.verification_expiry).to eq(1.day)
      end
    end
  end

  context 'verification not enabled for any actions' do
    describe 'permitted_by' do
      it 'returns an error if no methods are enabled' do
        expect { create(:permission, :by_verified, global_custom_fields: nil) }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
