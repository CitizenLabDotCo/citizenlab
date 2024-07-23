# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsFieldsService do
  let(:service) { described_class.new }

  before do
    create(:custom_field_gender, enabled: true, required: false)
    create(:custom_field_birthyear, enabled: true, required: true)
    SettingsService.new.activate_feature! 'custom_permitted_by'
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '#fields_for_permission' do
    context 'global_custom_fields is true' do
      it 'returns non-persisted default fields when permitted_by "users"' do
        permission = create(:permission, permitted_by: 'users', global_custom_fields: true)
        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 2
        expect(fields.map(&:persisted?)).to match_array [false, false]
        expect(fields.pluck(:required)).to match_array([false, true])
      end

      it 'returns non-persisted default fields when permitted_by "verified"' do
        permission = create(:permission, permitted_by: 'users', global_custom_fields: true)
        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 2
        expect(fields.map(&:persisted?)).to match_array [false, false]
        expect(fields.pluck(:required)).to match_array([false, true])
      end

      it 'returns no permissions fields when permitted_by "everyone"' do
        permission = create(:permission, permitted_by: 'everyone', global_custom_fields: true)
        expect(service.fields_for_permission(permission)).to be_empty
      end

      it 'returns no permissions fields when permitted_by "everyone_confirmed_email"' do
        permission = create(:permission, permitted_by: 'everyone_confirmed_email', global_custom_fields: true)
        expect(service.fields_for_permission(permission)).to be_empty
      end
    end

    context 'global_custom_fields is false' do
      let(:permission) { create(:permission, permitted_by: 'users', global_custom_fields: false) }

      it 'returns no fields by default for all permitted_by values' do
        %w[everyone everyone_confirmed_email users verified].each do |permitted_by|
          permission.update!(permitted_by: permitted_by)
          expect(service.fields_for_permission(permission)).to be_empty
        end
      end

      it 'returns persisted fields for all permitted_by values' do
        domicile_field = create(:permissions_field, permission: permission, custom_field: create(:custom_field_domicile))
        %w[everyone everyone_confirmed_email users verified].each do |permitted_by|
          permission.update!(permitted_by: permitted_by)
          fields = service.fields_for_permission(permission)
          expect(fields.count).to eq 1
          expect(fields.first.persisted?).to be true
          expect(fields.first).to eq domicile_field
        end
      end
    end
  end

  describe '#persist_default_fields' do
    let(:permission) { create(:permission, permitted_by: 'users') }

    context 'permitted_by is "users" and has no persisted permissions fields' do
      it 'creates default fields for the permission in the correct order' do
        service.persist_default_fields(permission)
        fields = permission.permissions_fields
        expect(fields.count).to eq 2
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:required)).to eq [false, true]
      end
    end

    context 'permitted_by is "everyone" and has no persisted permissions fields' do
      it 'does not persist any fields as there are no defaults' do
        permission.update!(permitted_by: 'everyone')
        service.persist_default_fields(permission)
        expect(permission.permissions_fields).to be_empty
      end
    end

    context 'permission already has fields' do
      it 'does not add fields' do
        service.persist_default_fields(permission)
        num_permissions_fields = permission.permissions_fields.count

        service.persist_default_fields(permission)
        expect(permission.permissions_fields.count).to eq num_permissions_fields
      end
    end
  end
end
