# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PermissionsField do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:permissions_field)).to be_valid
    end

    it 'is not valid if "custom_field" and no custom field is associated' do
      expect(build(:permissions_field, custom_field: nil)).not_to be_valid
    end

    it 'is valid if "email" or "name" and no custom field is associated' do
      expect(build(:permissions_field, field_type: 'email', custom_field: nil)).to be_valid
      expect(build(:permissions_field, field_type: 'name', custom_field: nil)).to be_valid
    end
  end

  describe '#prevent_non_custom_permitted_by' do
    context 'custom permitted_by is NOT enabled' do
      it 'is valid for ALL permitted_by values' do
        expect(build(:permissions_field, permission: create(:permission, permitted_by: 'users'))).to be_valid
        expect(build(:permissions_field, permission: create(:permission, permitted_by: 'everyone_confirmed_email'))).to be_valid
        expect(build(:permissions_field, permission: create(:permission, permitted_by: 'groups'))).to be_valid
      end
    end

    context 'custom permitted_by is enabled' do
      before do
        SettingsService.new.activate_feature! 'custom_permitted_by'
      end

      it 'is not valid when permitted_by is NOT "custom"' do
        expect(build(:permissions_field, permission: create(:permission, permitted_by: 'users'))).not_to be_valid
        expect(build(:permissions_field, permission: create(:permission, permitted_by: 'everyone_confirmed_email'))).not_to be_valid
        expect(build(:permissions_field, permission: create(:permission, permitted_by: 'groups'))).not_to be_valid
      end

      it 'is valid when permitted_by is "custom"' do
        expect(build(:permissions_field, permission: create(:permission, permitted_by: 'custom'))).to be_valid
      end
    end
  end

  describe '#destroy' do
    it 'allows field_type: "custom_field" to be destroyed' do
      field = create(:permissions_field, field_type: 'custom_field')
      field.destroy
      expect(field).to be_destroyed
    end

    it 'does not allow field_type: "name" to be destroyed' do
      field = create(:permissions_field, field_type: 'name')
      field.destroy
      expect(field).not_to be_destroyed
    end

    it 'does not allow field_type: "email" to be destroyed' do
      field = create(:permissions_field, field_type: 'email')
      field.destroy
      expect(field).not_to be_destroyed
    end
  end

  describe 'only one field_type per permission' do
    it 'does not allow more than one field_type: "email" per permission' do
      permission = create(:permission)
      create(:permissions_field, permission: permission, field_type: 'email')
      field = build(:permissions_field, permission: permission, field_type: 'email')
      expect(field).not_to be_valid
    end

    it 'does not allow more than one field_type: "name" per permission' do
      permission = create(:permission)
      create(:permissions_field, permission: permission, field_type: 'name')
      field = build(:permissions_field, permission: permission, field_type: 'name')
      expect(field).not_to be_valid
    end

    it 'does allow multiple field_types of "custom_field" per permission' do
      permission = create(:permission)
      create(:permissions_field, permission: permission, field_type: 'custom_field')
      field = build(:permissions_field, permission: permission, field_type: 'custom_field')
      expect(field).to be_valid
    end
  end

  describe '#validate_config_keys' do
    it 'does not allow field_type: "name" to have any config' do
      field = build(:permissions_field, field_type: 'name', config: { 'password' => true })
      expect(field).not_to be_valid
    end

    it 'does not allow field_type: "custom_field" to have any config' do
      field = build(:permissions_field, field_type: 'custom_field', config: { 'confirmed' => true })
      expect(field).not_to be_valid
    end

    it 'allows field_type: "email" to have "password" & "confirmed" config keys' do
      field = build(:permissions_field, field_type: 'email', config: { 'password' => true, 'confirmed' => true })
      expect(field).to be_valid
    end

    it 'does not allow field_type: "email" to have any other config keys' do
      field = build(:permissions_field, field_type: 'email', config: { 'password' => true, 'confirmed' => true, 'space_monkey' => false })
      expect(field).not_to be_valid
    end
  end
end
