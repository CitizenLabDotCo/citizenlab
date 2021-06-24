require "rails_helper"

describe UserRoleService do
  let(:service) { UserRoleService.new }

  describe "moderators_for_project" do
    it "lists only project moderators and admins" do
      project = create(:project)
      other_project = create(:project)
      mortal = create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [other_project, project])
      also_moderator = create(:project_moderator, projects: [project])
      other_moderator = create(:project_moderator, projects: [other_project])

      expect(service.moderators_for_project(project).ids).to match_array [admin.id, moderator.id, also_moderator.id]
    end
  end
end
