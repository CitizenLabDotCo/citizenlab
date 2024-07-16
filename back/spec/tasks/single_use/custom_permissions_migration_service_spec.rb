# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../lib/tasks/single_use/services/custom_permissions_migration_service'

RSpec.describe Tasks::SingleUse::Services::CustomPermissionsMigrationService do
  subject(:service) { described_class.new }

  before { SettingsService.new.activate_feature! 'custom_permitted_by' }

  # TODO: JS - Add more tests and make them cover everything
  describe '#change_permissions_to_custom' do
    before { permission } # Create permission

    context 'feature flag is enabled' do
      context 'permitted_by is "group" and no custom fields saved' do
        let(:permission) { create(:permission, permitted_by: 'groups') }

        it 'changes permitted_by to custom and inserts default fields' do
          service.change_permissions_to_custom
          permission.reload
          expect(permission.permitted_by).to eq 'custom'
          expect(permission.permissions_fields.count).to eq 2
        end
      end

      context 'permitted_by is "everyone_confirmed_email"' do
        let(:permission) { create(:permission, permitted_by: 'everyone_confirmed_email', global_custom_fields: true) }

        it 'does nothing if global_custom_fields is true' do
          service.change_permissions_to_custom
          permission.reload
          expect(permission.permitted_by).to eq 'everyone_confirmed_email'
          expect(permission.permissions_fields.count).to eq 0
        end

        it 'does nothing if global_custom_fields is false but there are no fields' do
          permission.update!(global_custom_fields: false)
          service.change_permissions_to_custom
          permission.reload
          expect(permission.permitted_by).to eq 'everyone_confirmed_email'
          expect(permission.permissions_fields.count).to eq 0
        end

        it 'changes permitted_by to custom and inserts default fields if global_custom_fields is false and there are fields' do
          SettingsService.new.deactivate_feature! 'custom_permitted_by' # Turned off so we can create test data
          permission.update!(global_custom_fields: false)
          create(:permissions_field, custom_field: create(:custom_field_birthyear), permission: permission)

          SettingsService.new.activate_feature! 'custom_permitted_by'
          service.change_permissions_to_custom
          permission.reload
          expect(permission.permitted_by).to eq 'custom'
          expect(permission.permissions_fields.count).to eq 3
          expect(permission.permissions_fields.pluck(:field_type)).to match_array(%w[name email custom_field])
        end
      end
    end

    context 'feature flag is NOT enabled' do
      let(:permission) { create(:permission, permitted_by: 'groups') }

      before { SettingsService.new.deactivate_feature! 'custom_permitted_by' }

      it 'does not change permitted_by or add any fields' do
        service.change_permissions_to_custom
        permission.reload
        expect(permission.permitted_by).to eq 'groups'
        expect(permission.permissions_fields).to be_empty
      end
    end
  end
end
