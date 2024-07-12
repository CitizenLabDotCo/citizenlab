# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsFieldsService do
  let(:service) { described_class.new }

  before do
    create(:custom_field_gender, enabled: true, required: false)
    SettingsService.new.activate_feature! 'custom_permitted_by'
  end

  describe '#create_or_update_default_fields' do
    it 'creates permissions for "users", "everyone" and "everyone_confirmed_email" with action "visiting"' do
      service.create_or_update_default_fields

      expect(Permission.count).to eq 3
      expect(Permission.where(action: 'visiting').count).to eq 3
      expect(Permission.where(action: 'visiting', permitted_by: 'users').count).to eq 1
      expect(Permission.where(action: 'visiting', permitted_by: 'everyone').count).to eq 1
      expect(Permission.where(action: 'visiting', permitted_by: 'everyone_confirmed_email').count).to eq 1
    end

    it 'creates default fields in correct order for all permissions with permitted_by "users", "everyone" and "everyone_confirmed_email"' do
      service.create_or_update_default_fields

      expect(PermissionsField.count).to eq 7 # 3 for 'users', 2 for 'everyone', 2 for 'everyone_confirmed_email
      expect(PermissionsField.where(field_type: 'name').count).to eq 3
      expect(PermissionsField.where(field_type: 'email').count).to eq 3
      expect(PermissionsField.where(field_type: 'custom_field').count).to eq 1
      expect(PermissionsField.where(field_type: 'name').pluck(:ordering)).to eq [0, 0, 0]
      expect(PermissionsField.where(field_type: 'email').pluck(:ordering)).to eq [1, 1, 1]
      expect(PermissionsField.where(field_type: 'custom_field').pluck(:ordering)).to eq [2]
    end

    it 'updates existing fields if they change at a global level' do
      service.create_or_update_default_fields
      expect(PermissionsField.where(field_type: 'custom_field').count).to eq 1

      # Disable the gender custom field
      CustomField.find_by(resource_type: 'User').update!(enabled: false)
      service.create_or_update_default_fields
      expect(PermissionsField.where(field_type: 'custom_field').count).to eq 0
    end
  end

  # TODO: JS - Fix these tests and make them cover everything
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
          permission.update!(global_custom_fields: false)
          create(:permissions_field, custom_field: create(:custom_field_birthyear), permission: permission)
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

  describe '#create_default_fields_for_custom_permitted_by' do
    let(:permission) { create(:permission, permitted_by: 'custom') }

    context 'permitted_by is "custom" and has no fields' do
      it 'creates default fields for the permission in the correct order' do
        service.create_default_fields_for_custom_permitted_by(permission: permission, previous_permitted_by: 'users')
        fields = permission.permissions_fields
        expect(fields.count).to eq 3
        expect(fields.pluck(:field_type)).to eq %w[name email custom_field]
        expect(fields.pluck(:ordering)).to eq [0, 1, 2]
        expect(fields.pluck(:required)).to eq [true, true, false]
      end
    end

    context 'permitted_by is not "custom"' do
      it 'does nothing' do
        permission.update!(permitted_by: 'users')
        service.create_default_fields_for_custom_permitted_by(permission: permission, previous_permitted_by: 'users')
        expect(permission.permissions_fields).to be_empty
      end
    end

    context 'permission already has fields' do
      it 'does not add fields' do
        service.create_default_fields_for_custom_permitted_by(permission: permission)
        num_permissions_fields = permission.permissions_fields.count

        service.create_default_fields_for_custom_permitted_by(permission: permission)
        expect(permission.permissions_fields.count).to eq num_permissions_fields
      end
    end
  end
end
