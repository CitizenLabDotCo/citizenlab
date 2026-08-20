# frozen_string_literal: true

require 'rails_helper'

describe Permissions::CustomFieldsBehaviorService do
  let(:service) { described_class.new }

  # The platform's demographic questions, which the 'global' behavior resolves to.
  let!(:domicile_field) { create(:custom_field_domicile, enabled: true, required: true) }
  let!(:gender_field) { create(:custom_field_gender, enabled: true, required: false) }

  # A permission from before the column existed: the attributes it replaces are
  # what it has to be derived from.
  def legacy_permission(global_custom_fields:, **attributes)
    permission = create(:permission, **attributes)
    permission.update_columns(global_custom_fields: global_custom_fields, custom_fields_behavior: nil)
    permission.reload
  end

  def persist_global_fields(permission)
    [[domicile_field, true], [gender_field, false]].each_with_index do |(field, required), index|
      create(:permissions_custom_field, permission: permission, custom_field: field, required: required, ordering: index)
    end
    permission.reload
  end

  describe '#derive' do
    it "returns 'global' when global_custom_fields is true" do
      permission = legacy_permission(global_custom_fields: true)
      expect(service.derive(permission)).to eq 'global'
    end

    it "returns 'disabled' when no fields are persisted" do
      permission = legacy_permission(global_custom_fields: false)
      expect(service.derive(permission)).to eq 'disabled'
    end

    it "returns 'disabled' rather than 'global' when the platform has no enabled fields either" do
      domicile_field.update!(enabled: false)
      gender_field.update!(enabled: false)
      permission = legacy_permission(global_custom_fields: false)
      expect(service.derive(permission)).to eq 'disabled'
    end

    it "returns 'global' when the persisted fields are the platform's" do
      permission = persist_global_fields(legacy_permission(global_custom_fields: false))
      expect(service.derive(permission)).to eq 'global'
    end

    it "returns 'custom' when a persisted field differs in whether it is required" do
      permission = persist_global_fields(legacy_permission(global_custom_fields: false))
      permission.permissions_custom_fields.find_by(custom_field: gender_field).update!(required: true)
      expect(service.derive(permission.reload)).to eq 'custom'
    end

    it "returns 'custom' when the persisted fields are the platform's in another order" do
      permission = persist_global_fields(legacy_permission(global_custom_fields: false))
      permission.permissions_custom_fields.find_by(custom_field: gender_field).insert_at(0)
      expect(service.derive(permission.reload)).to eq 'custom'
    end

    it "returns 'custom' when a field the platform does not have is persisted" do
      permission = persist_global_fields(legacy_permission(global_custom_fields: false))
      create(:permissions_custom_field, permission: permission, custom_field: create(:custom_field_birthyear, enabled: false), ordering: 2)
      expect(service.derive(permission.reload)).to eq 'custom'
    end

    it "returns 'custom' when one of the platform's fields is not persisted" do
      permission = legacy_permission(global_custom_fields: false)
      create(:permissions_custom_field, permission: permission, custom_field: domicile_field, required: true, ordering: 0)
      expect(service.derive(permission.reload)).to eq 'custom'
    end

    # 'global' resolves through #default_fields, which is empty for these, so calling
    # them 'global' would stop them asking the questions they ask today.
    %w[everyone admins_moderators].each do |permitted_by|
      it "returns 'custom' for the platform's own fields when permitted_by is '#{permitted_by}'" do
        permission = legacy_permission(
          global_custom_fields: false,
          permitted_by: permitted_by,
          action: 'posting_idea',
          permission_scope: create(:native_survey_phase)
        )
        expect(service.derive(persist_global_fields(permission))).to eq 'custom'
      end
    end

    it 'ignores the permissions_custom_fields feature being deactivated' do
      SettingsService.new.deactivate_feature!('permissions_custom_fields')
      permission = legacy_permission(global_custom_fields: false)
      create(:permissions_custom_field, permission: permission, custom_field: domicile_field, required: true, ordering: 0)
      expect(service.derive(permission.reload)).to eq 'custom'
    end
  end

  describe 'Permission#custom_fields_behavior' do
    it 'derives the value while the column is still empty' do
      permission = legacy_permission(global_custom_fields: false)
      expect(permission.custom_fields_behavior).to eq 'disabled'
    end

    it 'returns the stored value once the column is filled in' do
      permission = legacy_permission(global_custom_fields: true)
      permission.update!(custom_fields_behavior: 'disabled')
      expect(permission.reload.custom_fields_behavior).to eq 'disabled'
    end
  end
end
