require 'rails_helper'

describe ProjectHolderOrderingPolicy do
  subject { ProjectHolderOrderingPolicy.new(user, project_holder_ordering) }
  let(:scope) { ProjectHolderOrderingPolicy::Scope.new(user, ProjectHolderOrdering) }

  context "on a public project" do 
    let!(:project_holder_ordering) { create(:project) ; ProjectHolderService.new.fix_project_holder_orderings! ; ProjectHolderOrdering.first }
    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:reorder) }

      it "should index the project holder"  do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:reorder) }

      it "should index the project holder"  do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:reorder) }

      it "should index the project holder"  do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator of another project" do
      let(:user) { u = create(:moderator, project: create(:project)) ; ProjectHolderService.new.fix_project_holder_orderings! ; u }

      it { should_not permit(:reorder) }

      it "should index the project holder"  do
        expect(scope.resolve.size).to eq 2
      end
    end
  end

  context "on a private admins project" do 
    let!(:project) { p = create(:private_admins_project) ; ProjectHolderService.new.fix_project_holder_orderings! ; p }
    let!(:project_holder_ordering) { ProjectHolderOrdering.first }
    context "for a visitor" do
      let(:user) { nil }

      it { should_not permit(:reorder) }

      it "should not index the project holder"  do
        expect(scope.resolve.size).to eq 0

      end
    end

    context "for a user" do
      let(:user) { create(:user) }

      it { should_not permit(:reorder) }

      it "should not index the project holder"  do
        expect(scope.resolve.size).to eq 0
      end
    end

    context "for an admin" do
      let(:user) { create(:admin) }

      it { should permit(:reorder) }

      it "should index the project holder"  do
        expect(scope.resolve.size).to eq 1
      end
    end

    context "for a moderator" do
      let(:user) { create(:moderator, project: project) }

      it { should_not permit(:reorder) }

      it "should index the project holder"  do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context "for a visitor on a private groups project" do
    let!(:user) { nil }
    let!(:project_holder_ordering) { create(:private_groups_project) ; ProjectHolderService.new.fix_project_holder_orderings! ; ProjectHolderOrdering.first }

    it { should_not permit(:reorder) }

    it "should not index the project holder"  do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a private groups project where she's no member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) { create(:smart_group, rules: [
      {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
    ])}
    let!(:project_holder_ordering) { create(:project, visible_to: 'groups', groups: [group]) ; ProjectHolderService.new.fix_project_holder_orderings! ; ProjectHolderOrdering.first }

    it { should_not permit(:reorder) }

    it "should not index the project holder"  do
      expect(scope.resolve.size).to eq 0
    end
  end
end