# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsFieldsService do
  let(:service) { described_class.new }

  before do
    @gender_field = create(:custom_field_gender, enabled: false, required: false)
    @birthyear_field = create(:custom_field_birthyear, enabled: true, required: false)
    SettingsService.new.activate_feature! 'custom_permitted_by'
    SettingsService.new.activate_feature! 'user_confirmation'

    configuration = AppConfiguration.instance
    settings = configuration.settings
    settings['verification'] = {
      allowed: true,
      enabled: true,
      verification_methods: [{ name: 'bogus' }]
    }
    configuration.save!
  end

  describe '#fields_for_permission' do
    it 'returns verification in non-persisted default fields when permitted_by "users"' do
      permission = create(:permission, permitted_by: 'users')

      fields = service.fields_for_permission(permission)
      expect(fields.count).to eq 4
      expect(fields.map(&:persisted?)).to eq [false, false, false, false]
      expect(fields.pluck(:field_type)).to eq %w[name email verification custom_field]
      expect(fields.pluck(:enabled)).to eq [true, true, false, true]
      expect(fields.pluck(:required)).to eq [true, true, false, false]
      expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => true, 'confirmed' => true })
    end
  end

  describe '#create_default_fields_for_custom_permitted_by' do
    let(:permission) { create(:permission, permitted_by: 'custom') }

    context 'permitted_by is "custom" and has no fields' do
      it 'creates default fields for the permission in the correct order' do
        service.create_default_fields_for_custom_permitted_by(permission: permission, previous_permitted_by: 'users')
        fields = permission.permissions_fields
        expect(fields.count).to eq 4
        expect(fields.pluck(:field_type)).to eq %w[name email verification custom_field]
        expect(fields.pluck(:ordering)).to eq [0, 1, 2, 3]
        expect(fields.pluck(:enabled)).to eq [true, true, false, true]
        expect(fields.pluck(:required)).to eq [true, true, false, false]
      end
    end
  end

  describe '#enforce_restrictions' do
    let(:permission) { create(:permission, permitted_by: 'custom') }
    let(:verification_field) { permission.permissions_fields.find_by(field_type: 'verification') }

    before do
      service.create_default_fields_for_custom_permitted_by(permission: permission, previous_permitted_by: 'users')
    end

    context 'when verification field is disabled' do
      it 'does not create a permissions_field' do
        service.enforce_restrictions(verification_field)
        fields = permission.reload.permissions_fields
        expect(fields.pluck(:ordering)).to eq [0, 1, 2, 3]
        expect(fields.pluck(:field_type)).to eq %w[name email verification custom_field]
        expect(fields.pluck(:required)).to eq [true, true, false, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[birthyear]
      end
    end

    context 'when verification field is enabled' do
      before { verification_field.update!(enabled: true, required: true) }

      it 'creates a permission_field if it does not exist' do
        service.enforce_restrictions(verification_field)
        fields = permission.reload.permissions_fields
        expect(fields.pluck(:ordering)).to eq [0, 1, 2, 3, 4]
        expect(fields.pluck(:field_type)).to eq %w[name email verification custom_field custom_field]
        expect(fields.pluck(:required)).to eq [true, true, true, true, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender birthyear]
      end

      it 'sets the field to required and reorders if the permission_field is created but not required' do
        create(:permissions_field, permission: permission, field_type: 'custom_field', custom_field: @gender_field, enabled: true, required: false, ordering: 4)

        # check initial state
        fields = permission.permissions_fields
        expect(fields.pluck(:required)).to eq [true, true, true, false, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[birthyear gender]

        # check has changed after enforcing restrictions
        service.enforce_restrictions(verification_field)
        fields = permission.reload.permissions_fields
        expect(fields.pluck(:ordering)).to eq [0, 1, 2, 3, 4]
        expect(fields.pluck(:field_type)).to eq %w[name email verification custom_field custom_field]
        expect(fields.pluck(:required)).to eq [true, true, true, true, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender birthyear]
      end
    end
  end
end
