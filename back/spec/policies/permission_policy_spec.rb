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
    it { is_expected.to permit(:schema) }

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
    it { is_expected.to permit(:schema) }

    it 'indexes some permissions' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a member of a group with granular permissions' do
    let(:user) { create(:user) }
    let(:group) { create(:group) }
    let!(:permission) { create(:permission, permitted_by: 'groups', groups: [group]) }

    before do
      group.members << user
    end

    it { is_expected.not_to permit(:show)         }
    it { is_expected.not_to permit(:update)       }
    it { is_expected.to permit(:requirements) }
    it { is_expected.to permit(:schema) }

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
    it { is_expected.to permit(:schema) }

    it 'indexes the permission' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
