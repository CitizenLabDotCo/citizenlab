require 'rails_helper'

describe IdeaPolicy do
  subject { IdeaPolicy.new(user, idea) }
  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }

  context "for a user on an idea in a private groups project where she's not member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group], with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the idea"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a rules group with access" do
    let!(:user) { create(:user, email: 'user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group], with_permissions: true)}
    let!(:idea) { create(:idea, project: project) }

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should index the idea"  do
      expect(scope.resolve.size).to eq 1
    end
  end
end
