# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsFieldsService do
  let(:service) { described_class.new }

  before do
    @birthyear_field = create(:custom_field_birthyear, enabled: true, required: false)
    @gender_field = create(:custom_field_gender, enabled: false, required: false)
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

  # TODO: Add tests for #adding new group to permission when fields are persisted
  # TODO: Add tests for #changing permitted_by to verified when fields are persisted
  # In different test files though permissions_spec.rb?

  describe '#fields_for_permission' do
    context 'when permission is not permitted_by "verified" and there are no groups' do
      let(:permission) { create(:permission, permitted_by: 'users') }

      it 'returns default fields without those linked to verification' do
        fields = service.fields_for_permission(permission)
        expect(fields.pluck(:ordering)).to eq [0]
        expect(fields.pluck(:required)).to eq [false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[birthyear]
      end
    end

    context 'when permission is permitted_by "verified"' do
      let(:permission) { create(:permission, permitted_by: 'verified') }

      it 'adds additional fields linked to verification method' do
        permission = create(:permission, permitted_by: 'verified')
        fields = service.fields_for_permission(permission)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:required)).to eq [true, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender birthyear]
      end

      it 'sets the field to required and reorders if the permission_field is already there but not required' do
        @gender_field.update!(enabled: true)

        # check initial state
        permission = create(:permission, permitted_by: 'users')
        fields = service.fields_for_permission(permission)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:required)).to eq [false, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[birthyear gender]

        # check has changed after enforcing restrictions
        permission.update!(permitted_by: 'verified')
        fields = service.fields_for_permission(permission)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:required)).to eq [true, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender birthyear]
      end
    end
  end
end
