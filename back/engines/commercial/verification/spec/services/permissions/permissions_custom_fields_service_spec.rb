# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsCustomFieldsService do
  let(:service) { described_class.new }

  before do
    @domicile_field = create(:custom_field_domicile, enabled: true, required: false)
    @gender_field = create(:custom_field_gender, enabled: false, required: false)
    SettingsService.new.activate_feature! 'user_confirmation'
    SettingsService.new.activate_feature! 'verification', settings: { verification_methods: [{ name: 'fake_sso', enabled_for_verified_actions: true }] }
  end

  describe '#fields_for_permission' do
    context 'when permission is not permitted_by "verified" and there are no groups' do
      let(:permission) { create(:permission, permitted_by: 'users') }

      it 'returns default fields without those linked to verification' do
        fields = service.fields_for_permission(permission, return_hidden: true)
        expect(fields.pluck(:ordering)).to eq [0]
        expect(fields.pluck(:required)).to eq [false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[domicile]
      end
    end

    context 'when permission is permitted_by "verified"' do
      let(:permission) { create(:permission, permitted_by: 'verified') }

      it 'adds additional fields linked to verification method' do
        permission = create(:permission, permitted_by: 'verified')
        fields = service.fields_for_permission(permission, return_hidden: true)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:lock)).to eq ['verification', nil]
        expect(fields.pluck(:required)).to eq [true, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender domicile]
      end

      it 'sets the field to required and reorders if the permissions_custom_field is already there but not required' do
        @gender_field.update!(enabled: true)

        # check initial state
        permission = create(:permission, permitted_by: 'users')
        fields = service.fields_for_permission(permission, return_hidden: true)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:lock)).to eq [nil, nil]
        expect(fields.pluck(:required)).to eq [false, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[domicile gender]

        # check has changed after updating to verified permitted_by
        permission.update!(permitted_by: 'verified')
        fields = service.fields_for_permission(permission, return_hidden: true)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:lock)).to eq ['verification', nil]
        expect(fields.pluck(:required)).to eq [true, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender domicile]
      end

      it 'sets the value of lock to "verification" and reorders for fields already added and locked by groups' do
        permission = create(:permission, permitted_by: 'users')
        group = create(:smart_group, rules: [
          { ruleType: 'custom_field_select', customFieldId: @gender_field.id, predicate: 'is_one_of', value: ['a7212e05-2ff0-4c7f-89d3-dbfc7c049aa5'] }
        ])
        permission.groups << group

        # check initial state
        fields = service.fields_for_permission(permission, return_hidden: true)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:lock)).to eq [nil, 'group']
        expect(fields.pluck(:required)).to eq [false, true]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[domicile gender]

        # check has changed after updating to verified permitted_by
        permission.update!(permitted_by: 'verified')
        fields = service.fields_for_permission(permission, return_hidden: true)
        expect(fields.pluck(:ordering)).to eq [0, 1]
        expect(fields.pluck(:lock)).to eq ['verification', nil]
        expect(fields.pluck(:required)).to eq [true, false]
        expect(fields.filter_map { |f| f.custom_field&.code }).to eq %w[gender domicile]
      end
    end
  end
end
