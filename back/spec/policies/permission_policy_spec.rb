# frozen_string_literal: true

require 'rails_helper'

describe PermissionPolicy do
  subject { described_class.new(user, permission) }

  let(:scope) { PermissionPolicy::Scope.new(user, Permission) }

  context 'for a visitor' do
    let(:user) { nil }
    let!(:permission) { create(:permission, :by_everyone) }

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }
    it { is_expected.to permit(:requirements) }

    it 'indexes some permissions' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a user' do
    let(:user) { create(:user) }
    let!(:permission) { create(:permission, :by_everyone) }

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }
    it { is_expected.to permit(:requirements) }

    it 'indexes some permissions' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a member of a group with permissions on a phase' do
    let(:user) { create(:user) }
    let(:group) { create(:group) }
    let!(:permission) { create(:permission, permitted_by: 'users', groups: [group]) }

    before do
      group.members << user
    end

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }
    it { is_expected.to permit(:requirements) }

    it 'indexes some permissions' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for an admin' do
    let(:user) { create(:admin) }
    let!(:permission) { create(:permission, :by_admins_moderators) }

    it { is_expected.to permit(:show)             }
    it { is_expected.to permit(:update)           }
    it { is_expected.to permit(:requirements) }

    it 'indexes the permission' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'when user is moderator of the corresponding project' do
    let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true }) }
    let(:user) { create(:project_moderator, projects: [project]) }
    let(:permission) { project.phases.first.permissions.first }

    it { is_expected.to permit(:show)             }
    it { is_expected.to permit(:update)           }

    it 'indexes the permission' do
      expect(scope.resolve.size).to be > 0
    end
  end

  context 'when user is moderator of another project' do
    let(:phase) { create(:phase, with_permissions: true) }
    let(:permission) { phase.permissions.first }
    let(:user) { create(:project_moderator, projects: [create(:project)]) }

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }

    it 'does not index the permission' do
      expect(scope.resolve.size).to eq 0
    end
  end
end
