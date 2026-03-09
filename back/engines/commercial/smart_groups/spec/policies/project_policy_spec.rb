# frozen_string_literal: true

require 'rails_helper'

describe ProjectPolicy do
  subject { described_class.new(user, project) }

  let(:scope) { ProjectPolicy::Scope.new(user, Project) }
  let(:inverse_scope) { ProjectPolicy::InverseScope.new(project, User) }

  context "for a user on a private groups project where she's no member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) do
      create(
        :smart_group,
        rules: [
          { ruleType: 'email', predicate: 'is', value: 'user@test.com' }
        ]
      )
    end
    let!(:project) { create(:project, visible_to: 'groups', groups: [group]) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the project' do
      expect(scope.resolve.size).to eq 0
    end

    it 'does not include the user in the users that have access' do
      expect(inverse_scope.resolve).not_to include(user)
    end
  end

  context "for a user on a private groups project where she's a member of a rules group with access" do
    let!(:user) { create(:user, email: 'user@test.com') }
    let!(:group) do
      create(
        :smart_group,
        rules: [
          { ruleType: 'email', predicate: 'is', value: 'user@test.com' }
        ]
      )
    end
    let!(:project) { create(:project, visible_to: 'groups', groups: [group]) }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the project' do
      expect(scope.resolve.size).to eq 1
    end

    it 'includes the user in the users that have access' do
      expect(inverse_scope.resolve).to include(user)
    end
  end

  describe 'shared_permitted_attributes' do
    subject(:policy) { described_class.new(user, subject_project) }

    let(:subject_project) { create(:project) }

    shared_examples 'does not permit space_id' do
      it 'does not include space_id' do
        expect(policy.shared_permitted_attributes.flatten).not_to include(:space_id)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it 'includes space_id' do
        expect(policy.shared_permitted_attributes.flatten).to include(:space_id)
      end
    end

    # TODO: Insert test for space manager (moderator) once that role is implemented

    context 'for a project moderator' do
      let(:user) { create(:project_moderator) }

      it_behaves_like 'does not permit space_id'
    end

    context 'for a folder moderator' do
      let(:user) { create(:project_folder_moderator) }

      it_behaves_like 'does not permit space_id'
    end
  end
end
