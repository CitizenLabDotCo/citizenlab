# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:permission)).to be_valid
    end
  end

  describe 'global_custom_fields' do
    context 'everyone_confirmed_email' do
      it 'is false when created' do
        permission = create(:permission, :by_everyone_confirmed_email)
        expect(permission.global_custom_fields).to be_falsey
      end

      it 'is false when updated to everyone_confirmed_email' do
        permission = create(:permission, global_custom_fields: true)
        permission.update!(permitted_by: 'everyone_confirmed_email')
        expect(permission.global_custom_fields).to be_falsey
      end

      it 'is false even when set to true' do
        permission = create(:permission, :by_everyone_confirmed_email)
        permission.update!(global_custom_fields: true)
        expect(permission.global_custom_fields).to be_falsey
      end
    end

    context 'user' do
      it 'is true when created' do
        permission = create(:permission, :by_users, global_custom_fields: nil)
        expect(permission.global_custom_fields).to be_truthy
      end
    end
  end

  describe 'permission_fields' do
    before { Permissions::PermissionsFieldsService.new.create_or_update_default_fields }

    context '"custom_permitted_by" feature flag is enabled' do
      before { SettingsService.new.activate_feature! 'custom_permitted_by' }

      it 'returns platform default fields when permitted_by "users"' do
        permission = create(:permission, permitted_by: 'users')

        fields = permission.permissions_fields
        expect(fields.count).to eq 2
        expect(fields.pluck(:field_type)).to match_array(%w[name email])
        expect(fields.pluck(:enabled)).to match_array([true, true])
        expect(fields.pluck(:required)).to match_array([true, true])
        expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => true, 'confirmed' => true })
      end

      it 'returns disabled built-in fields when permitted_by "everyone"' do
        permission = create(:permission, permitted_by: 'everyone')

        fields = permission.permissions_fields
        expect(fields.count).to eq 2
        expect(fields.pluck(:field_type)).to match_array(%w[name email])
        expect(fields.pluck(:required)).to match_array([false, false])
        expect(fields.pluck(:enabled)).to match_array([false, false])
        expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => true, 'confirmed' => true })
      end

      it 'returns built fields with only email & not password when permitted_by "everyone_confirmed_email"' do
        permission = create(:permission, permitted_by: 'everyone_confirmed_email')

        fields = permission.permissions_fields
        expect(fields.count).to eq 2
        expect(fields.pluck(:field_type)).to match_array(%w[name email])
        expect(fields.pluck(:enabled)).to match_array([false, true])
        expect(fields.find { |f| f.field_type == 'email' }.config).to match({ 'password' => false, 'confirmed' => true })
      end
    end

    context '"custom_permitted_by" feature flag is NOT enabled' do
      before { SettingsService.new.deactivate_feature! 'custom_permitted_by' }

      it 'returns no fields by default' do
        permission = create(:permission, permitted_by: 'users')
        expect(permission.permissions_fields).to be_empty
      end

      it 'returns only field_type: custom_field if feature flag is NOT enabled' do
        SettingsService.new.deactivate_feature! 'custom_permitted_by'
        permission = create(:permission, permitted_by: 'users')
        _email_field = create(:permissions_field, permission: permission, field_type: 'email')
        birth_year_field = create(:permissions_field, permission: permission, field_type: 'custom_field', custom_field: create(:custom_field_birthyear))

        fields = permission.permissions_fields
        expect(fields.count).to eq 1
        expect(fields.first.field_type).to eq 'custom_field'
        expect(fields.first.id).to eq birth_year_field.id
      end
    end
  end

  describe 'scopes' do
    context 'ideation' do
      let(:phase) { create(:phase) }
      let!(:permission_commenting) { create(:permission, action: 'commenting_idea', permission_scope: phase) }
      let!(:permission_posting) { create(:permission, action: 'posting_idea', permission_scope: phase) }
      let!(:permission_reacting) { create(:permission, action: 'reacting_idea', permission_scope: phase) }

      it 'Returns permissions in the correct order' do
        permissions = described_class.order_by_action(phase)
        expect(permissions).to eq([permission_posting, permission_commenting, permission_reacting])
      end

      it 'Only returns permissions that are enabled in a phase' do
        phase.update!(reacting_enabled: false)
        permissions = described_class.filter_enabled_actions(phase)
        expect(permissions.size).to eq(2)
        expect(permissions).not_to include(permission_reacting)
      end
    end

    context 'native survey' do
      let(:phase) { create(:native_survey_phase, posting_enabled: false) }
      let!(:permission_posting) { create(:permission, action: 'posting_idea', permission_scope: phase) }

      it 'Returns all permissions for native surveys even if survey is not open to responses' do
        permissions = described_class.filter_enabled_actions(phase)
        expect(permissions.size).to eq(1)
        expect(permissions).to include(permission_posting)
      end
    end
  end

  describe 'permitted_by "custom"' do
    let(:groups) { create_list(:group, 2) }
    let(:permission) { create(:permission, permitted_by: 'custom', groups: groups) }

    it 'permissions are valid' do
      expect(permission).to be_valid
    end
  end
end
