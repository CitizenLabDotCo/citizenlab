# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsFieldsService do
  let(:service) { described_class.new(permission) }

  before do
    create(:custom_field_gender, enabled: true)
    SettingsService.new.activate_feature! 'custom_permitted_by'
  end

  describe '#fields' do
    context 'permitted_by is "custom"' do
      let(:permission) { create(:permission, permitted_by: 'custom') }

      it 'returns persisted fields' do
        service.insert_default_fields
        expect(service.fields.count).to eq 3
        expect(service.fields.pluck(:field_type)).to match_array(%w[name email custom_field])
        expect(service.fields.pluck(:id)).not_to include(nil)
      end
    end

    context 'permitted_by is NOT "custom"' do
      let(:permission) { create(:permission, permitted_by: 'users') }

      context 'feature flag is enabled' do
        it 'returns platform default fields when permitted_by "user"' do
          expect(service.fields.count).to eq 3
          expect(service.fields.pluck(:field_type)).to match_array(%w[name email custom_field])
          expect(service.fields.pluck(:id)).to match_array([nil, nil, nil])
        end

        it 'returns disabled built fields only disabled when permitted_by "everyone"' do
          permission.update!(permitted_by: 'everyone')
          expect(service.fields.count).to eq 2
          expect(service.fields.pluck(:field_type)).to match_array(%w[name email])
          expect(service.fields.pluck(:id)).to match_array([nil, nil])
        end


      end

      context ' feature flag is NOT enabled' do
        it 'returns only custom fields if feature flag is NOT enabled' do
          SettingsService.new.deactivate_feature! 'custom_permitted_by'
          _email_field = create(:permissions_field, permission: permission, field_type: 'email')
          birth_year_field = create(:permissions_field, permission: permission, field_type: 'custom_field', custom_field: create(:custom_field_birthyear))
          expect(service.fields.count).to eq 1
          expect(service.fields.first.field_type).to eq 'custom_field'
          expect(service.fields.first.id).to eq birth_year_field.id
        end
      end
    end
  end

  describe '#convert_permission_to_custom_permitted_by' do
    context 'feature flag is enabled' do
      context 'permitted_by is "group" and no custom fields saved' do
        let(:permission) { create(:permission, permitted_by: 'groups') }

        it 'changes permitted_by to custom and inserts default fields' do
          service.convert_permission_to_custom_permitted_by
          permission.reload
          expect(permission.permitted_by).to eq 'custom'
          expect(permission.permissions_fields.count).to eq 2
        end
      end

      context 'permitted_by is "everyone_confirmed_email"' do
        let(:permission) { create(:permission, permitted_by: 'everyone_confirmed_email', global_custom_fields: true) }

        it 'does nothing if global_custom_fields is true' do
          service.convert_permission_to_custom_permitted_by
          permission.reload
          expect(permission.permitted_by).to eq 'everyone_confirmed_email'
          expect(permission.permissions_fields.count).to eq 0
        end

        it 'changes permitted_by to custom and inserts default fields if global_custom_fields is false' do
          permission.update!(global_custom_fields: false)
          create(:permissions_field, custom_field: create(:custom_field_birthyear), permission: permission)
          service.convert_permission_to_custom_permitted_by
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
        service.convert_permission_to_custom_permitted_by
        permission.reload
        expect(permission.permitted_by).to eq 'groups'
        expect(permission.permissions_fields).to be_empty
      end
    end
  end
end
