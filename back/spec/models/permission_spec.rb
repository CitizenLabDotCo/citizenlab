# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission, type: :model do
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

  describe 'scopes' do
    let(:project) { create(:project) }
    let!(:permission_commenting) { create(:permission, action: 'commenting_idea', permission_scope: project) }
    let!(:permission_posting) { create(:permission, action: 'posting_idea', permission_scope: project) }
    let!(:permission_voting) { create(:permission, action: 'voting_idea', permission_scope: project) }

    it 'Returns permissions in the correct order' do
      permissions = described_class.order_by_action(project)
      expect(permissions).to eq([permission_posting, permission_commenting, permission_voting])
    end

    it 'Only returns permissions that are enabled in a project' do
      project.update!(voting_enabled: false)
      permissions = described_class.filter_enabled_actions(project)
      expect(permissions.size).to eq(2)
      expect(permissions).not_to include(permission_voting)
    end
  end
end
