# frozen_string_literal: true

require 'rails_helper'

describe PermissionPolicy do
  subject { described_class.new(user, permission) }

  let(:scope) { PermissionPolicy::Scope.new(user, Permission) }

  context 'when user is moderator of the corresponding project' do
    let(:project) { create(:continuous_project, with_permissions: true, participation_method: 'ideation') }
    let(:user) { create(:project_moderator, projects: [project]) }
    let(:permission) { project.permissions.first }

    it { is_expected.to permit(:show)             }
    it { is_expected.to permit(:update)           }

    it 'indexes the permission' do
      expect(scope.resolve.size).to be > 0
    end
  end

  context 'when user is moderator of another project' do
    let(:project) { create(:continuous_project, with_permissions: true, participation_method: 'ideation') }
    let(:permission) { project.permissions.first }
    let(:user) { create(:project_moderator, projects: [create(:project)]) }

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }

    it 'does not index the permission' do
      expect(scope.resolve.size).to eq 0
    end
  end
end
