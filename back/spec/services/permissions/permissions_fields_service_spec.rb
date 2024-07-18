# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsFieldsService do
  let(:service) { described_class.new }

  before do
    create(:custom_field_gender, enabled: true, required: false)
    SettingsService.new.activate_feature! 'custom_permitted_by'
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  # TODO: JS - Seems to be some leakage between tests, need to investigate
  describe '#fields_for_permission' do
    context '"custom_permitted_by" feature flag is enabled' do
      it 'returns non-persisted default fields when permitted_by "users"' do
        permission = create(:permission, permitted_by: 'users')

        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 3
        expect(fields.map(&:persisted?)).to match_array [false, false, false]
        expect(fields.pluck(:field_type)).to match_array(%w[name email custom_field])
        expect(fields.pluck(:enabled)).to match_array([true, true, true])
        expect(fields.pluck(:required)).to match_array([true, true, false])
        expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => true, 'confirmed' => true })
      end

      it 'returns non-persisted & disabled default fields without custom fields when permitted_by "everyone"' do
        permission = create(:permission, permitted_by: 'everyone')

        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 2
        expect(fields.map(&:persisted?)).to match_array [false, false]
        expect(fields.pluck(:field_type)).to match_array(%w[name email])
        expect(fields.pluck(:required)).to match_array([false, false])
        expect(fields.pluck(:enabled)).to match_array([false, false])
        expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => true, 'confirmed' => true })
      end

      it 'returns non-persisted default fields with only email & not password when permitted_by "everyone_confirmed_email"' do
        permission = create(:permission, permitted_by: 'everyone_confirmed_email')

        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 2
        expect(fields.map(&:persisted?)).to match_array [false, false]
        expect(fields.pluck(:field_type)).to match_array(%w[name email])
        expect(fields.pluck(:enabled)).to match_array([false, true])
        expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => false, 'confirmed' => true })
      end

      it 'returns persisted fields when permitted_by "custom"' do
        permission = create(:permission, permitted_by: 'custom')
        service.create_default_fields_for_custom_permitted_by(permission: permission, previous_permitted_by: 'users')

        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 3
        expect(fields.map(&:persisted?)).to match_array [true, true, true]
        expect(fields.pluck(:field_type)).to match_array(%w[name email custom_field])
        expect(fields.pluck(:enabled)).to match_array([true, true, true])
        expect(fields.pluck(:required)).to match_array([true, true, false])
        expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => true, 'confirmed' => true })
      end
    end

    context '"custom_permitted_by" feature flag is NOT enabled' do
      before { SettingsService.new.deactivate_feature! 'custom_permitted_by' }

      it 'returns no fields by default' do
        permission = create(:permission, permitted_by: 'users')
        expect(service.fields_for_permission(permission)).to be_empty
      end

      it 'returns only field_type: custom_field if feature flag is NOT enabled' do
        permission = create(:permission, permitted_by: 'users')
        email_field = create(:permissions_field, permission: permission, field_type: 'email')
        birth_year_field = create(:permissions_field, permission: permission, field_type: 'custom_field', custom_field: create(:custom_field_birthyear))

        fields = service.fields_for_permission(permission)
        expect(fields.count).to eq 1
        expect(fields.first.field_type).to eq 'custom_field'
        expect(fields.pluck(:id)).to include birth_year_field.id
        expect(fields.pluck(:id)).not_to include email_field.id
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

  describe '#enforce_restrictions' do
    let(:permission) { create(:permission, permitted_by: 'custom') }

    before { service.create_default_fields_for_custom_permitted_by(permission: permission, previous_permitted_by: 'users') }

    context 'email field is changed' do
      let(:email_field) { permission.permissions_fields.find_by(field_type: 'email') }

      it 'disables the name field if password is disabled' do
        email_field.config['password'] = false

        service.enforce_restrictions(email_field)
        name_field = permission.permissions_fields.find_by(field_type: 'name')
        name_field.reload
        expect(name_field.enabled).to be false
        expect(name_field.required).to be false
      end

      it 'enables the name field if password is enabled' do
        email_field.config['password'] = true
        name_field = permission.permissions_fields.find_by(field_type: 'name')
        name_field.update!(enabled: false)

        service.enforce_restrictions(email_field)
        name_field.reload
        expect(name_field.enabled).to be true
        expect(name_field.required).to be true
      end

      it 'ensures confirmed is true when turned on at a platform level' do
        email_field.config['confirmed'] = false

        service.enforce_restrictions(email_field)
        email_field.reload
        expect(email_field.config['confirmed']).to be true
      end

      it 'ensures confirmed is false when turned off at a platform level' do
        email_field.config['confirmed'] = true

        SettingsService.new.deactivate_feature! 'user_confirmation'
        service = described_class.new # Reset the service to pick up the new feature flag state
        service.enforce_restrictions(email_field)
        email_field.reload
        expect(email_field.config['confirmed']).to be false
      end
    end
  end
end
