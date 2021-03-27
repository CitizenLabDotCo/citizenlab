require 'rails_helper'

describe IdeaPolicy do
  subject(:policy) { described_class.new(user, idea) }

  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }

  context "for a user on an idea in a private groups project where she's not member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) do
      create(:smart_group, rules: [
               { ruleType: 'email', predicate: 'is', value: 'user@test.com' }
             ])
    end

    let!(:project) do
      create(:project, visible_to: 'groups', groups: [group])
    end
    let!(:idea) { create(:idea, project: project) }

    it { is_expected.not_to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the idea' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a rules group with access" do
    let!(:user) { create(:user, email: 'user@test.com') }
    let!(:group) do
      create(:smart_group, rules: [
               { ruleType: 'email', predicate: 'is', value: 'user@test.com' }
             ])
    end
    let!(:project) { create(:project, visible_to: 'groups', groups: [group]) }
    let!(:idea) { create(:idea, project: project) }

    it { is_expected.to permit(:show)    }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the idea' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
