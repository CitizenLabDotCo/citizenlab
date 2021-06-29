require 'rails_helper'

describe ProjectPolicy do
  subject { ProjectPolicy.new(user, project) }
  let(:scope) { ProjectPolicy::Scope.new(user, Project) }
  let(:inverse_scope) { ProjectPolicy::InverseScope.new(project, User) }

  context "for a user on a private groups project where she's no member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group])}

    it { should_not permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }
    it "should not index the project"  do
      expect(scope.resolve.size).to eq 0
    end

    it "should not include the user in the users that have access" do
      expect(inverse_scope.resolve).not_to include(user)
    end
  end

  context "for a user on a private groups project where she's a member of a rules group with access" do
    let!(:user) { create(:user, email: 'user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project) { create(:project, visible_to: 'groups', groups: [group])}

    it { should permit(:show)    }
    it { should_not permit(:create)  }
    it { should_not permit(:update)  }
    it { should_not permit(:destroy) }

    it "should index the project"  do
      expect(scope.resolve.size).to eq 1
    end

    it "should include the user in the users that have access" do
      expect(inverse_scope.resolve).to include(user)
    end
  end
end
