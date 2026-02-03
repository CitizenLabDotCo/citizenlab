# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsUpdateService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '#update_all_permissions' do
    let(:project) { create(:project) }
    let!(:invalid_permission) do
      permission = build(:permission, permission_scope: project)
      permission.save(validate: false)
      permission
    end

    it 'deletes any project scoped permissions' do
      expect(invalid_permission.permission_scope_type).to eq 'Project'

      service.update_all_permissions
      expect { invalid_permission.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe '#update_permissions_for_scope' do
    it 'changes the permissions for a phase when the method is changed' do
      phase = create(:phase, participation_method: 'ideation', with_permissions: true)
      expect(phase.permissions.pluck(:action)).to match_array %w[posting_idea commenting_idea reacting_idea attending_event]

      phase.update!(participation_method: 'voting', voting_method: 'budgeting', ideas_order: 'random')
      service.update_permissions_for_scope(phase)
      expect(phase.permissions.pluck(:action)).to match_array %w[voting commenting_idea attending_event]
    end

    it 'does not change permitted_by to "users" when changing from native_survey to ideation if permitted_by is "everyone"' do
      # It used to be that permitted_by was changed to "users" in this case. Now not anymore.
      phase = create(:native_survey_phase, with_permissions: true)
      phase.permissions.where(action: 'posting_idea').update!(permitted_by: 'everyone')
      expect(phase.permissions.pluck(:action)).to match_array %w[posting_idea attending_event]
      expect(phase.permissions.pluck(:permitted_by)).to match_array %w[everyone users]

      phase.update!(participation_method: 'ideation', input_term: 'idea')
      service.update_permissions_for_scope(phase)
      expect(phase.permissions.pluck(:action)).to match_array %w[posting_idea commenting_idea reacting_idea attending_event]
      expect(phase.permissions.pluck(:permitted_by)).to match_array %w[everyone users users users]
    end

    it 'does not change permitted_by to "users" for external surveys permitted_by "everyone"' do
      phase = create(:typeform_survey_phase, with_permissions: true)
      permission = phase.permissions.first
      permission.update!(permitted_by: 'everyone')
      service.update_permissions_for_scope(phase)

      expect(permission.reload.permitted_by).to eq 'everyone'
    end

    it 'does not changes permitted_by from native_survey if permitted_by is not "everyone"' do
      phase = create(:native_survey_phase, with_permissions: true)
      phase.permissions.where(action: 'posting_idea').update!(permitted_by: 'users')
      expect(phase.permissions.pluck(:action)).to match_array %w[posting_idea attending_event]
      expect(phase.permissions.pluck(:permitted_by)).to match_array %w[users users]

      phase.update!(participation_method: 'ideation', input_term: 'idea')
      service.update_permissions_for_scope(phase)
      expect(phase.permissions.pluck(:action)).to match_array %w[posting_idea commenting_idea reacting_idea attending_event]
      expect(phase.permissions.pluck(:permitted_by)).to match_array %w[users users users users]
    end

    it 'sets all permissions to "users" when creating new permissions' do
      phase = create(:phase)
      expect(phase.permissions).to be_empty

      service.update_permissions_for_scope(phase)
      expect(phase.permissions.pluck(:permitted_by)).to match_array %w[users users users users]
    end
  end
end
