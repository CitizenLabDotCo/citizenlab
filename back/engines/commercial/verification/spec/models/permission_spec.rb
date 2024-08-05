# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission do
  context 'verification enabled for an action' do
    before do
      configuration = AppConfiguration.instance
      settings = configuration.settings
      settings['verification'] = { allowed: true, enabled: true, verification_methods: [{ name: 'fake_sso' }] }
      configuration.save!
    end

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
  end

  context 'verification not enabled for any actions' do
    describe 'permitted_by' do
      it 'returns an error if no methods are enabled' do
        expect { create(:permission, :by_verified, global_custom_fields: nil) }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
