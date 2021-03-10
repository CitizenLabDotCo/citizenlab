require 'rails_helper'

describe PermissionPolicy do
  subject { PermissionPolicy.new(user, permission) }
  let(:scope) { PermissionPolicy::Scope.new(user, Permission) }

  context "for a visitor" do
    let!(:permission) { create(:permission, permitted_by: 'everyone') }
    let!(:denied_permission) { create(:permission, permitted_by: 'admins_moderators') }
    let(:user) { nil }

    it { should_not permit(:show)         }
    it { should_not permit(:update)       }

    it "should index some permissions" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a user" do
    let!(:permission) { create(:permission, permitted_by: 'everyone') }
    let!(:denied_permission) { create(:permission, permitted_by: 'admins_moderators') }
    let(:user) { nil }

    it { should_not permit(:show)         }
    it { should_not permit(:update)       }

    it "should index some permissions" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a member of a group with granular permissions" do
    let(:group) { create(:group) }
    let!(:permission) { create(:permission, permitted_by: 'groups', groups: [group]) }
    let!(:denied_permission) { create(:permission, permitted_by: 'admins_moderators') }
    let(:user) { create(:user) }

    before do
      group.members << user
    end

    it { should_not permit(:show)         }
    it { should_not permit(:update)       }

    it "should index some permissions" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for an admin" do
    let(:user) { create(:admin) }
    let!(:permission) { create(:permission, permitted_by: 'admins_moderators') }

    it { should permit(:show)             }
    it { should permit(:update)           }

    it "should index the permission" do
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a moderator of the project to which the permission belongs" do
    let(:project) { create(:continuous_project, participation_method: 'ideation', with_permissions: true) }
    let(:user) { create(:moderator, project: project) }
    let(:permission) { project.permissions.first }

    it { should permit(:show)             }
    it { should permit(:update)           }

    it "should index the permission" do
      expect(scope.resolve.size).to be > 0
    end
  end

  context "for a moderator of another project" do
    let(:project) { create(:continuous_project, participation_method: 'ideation', with_permissions: true) }
    let(:permission) { project.permissions.first }
    let(:user) { create(:moderator, project: create(:project)) }

    it { should_not permit(:show)         }
    it { should_not permit(:update)       }

    it "should not index the permission" do
      expect(scope.resolve.size).to eq 0
    end
  end
end
