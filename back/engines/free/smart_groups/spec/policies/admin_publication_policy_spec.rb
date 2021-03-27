require 'rails_helper'

describe AdminPublicationPolicy do
  subject { AdminPublicationPolicy.new(user, admin_publication) }
  let(:scope) { AdminPublicationPolicy::Scope.new(user, AdminPublication) }

  context "for a user on a private groups project where she's no member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:admin_publication) { create(:project, visible_to: 'groups', groups: [group]).admin_publication }

    it { should_not permit(:reorder) }

    it "should not index the project holder"  do
      expect(scope.resolve.size).to eq 0
    end
  end
end
