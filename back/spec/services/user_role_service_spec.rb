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

  describe "moderators_for" do
    it "lists all moderators of a project" do
      project = create(:project)
      other_project = create(:project)
      mortal = create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [project, other_project])
      other_moderator = create(:project_moderator, projects: [other_project])

      expect(service.moderators_for(project).ids).to match_array [admin.id, moderator.id]
    end

    it "lists all moderators of an idea" do
      project = create(:project)
      other_project = create(:project)
      mortal = create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [other_project, project])
      also_moderator = create(:project_moderator, projects: [project])
      other_moderator = create(:project_moderator, projects: [other_project])
      idea = create(:idea, project: project)

      expect(service.moderators_for(idea).ids).to match_array [admin.id, moderator.id, also_moderator.id]
    end

    it "lists all moderators of a comment" do
      project = create(:project)
      other_project = create(:project)
      mortal = create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [other_project, project])
      also_moderator = create(:project_moderator, projects: [project])
      other_moderator = create(:project_moderator, projects: [other_project])
      idea = create(:idea, project: project)
      comment = create(:comment, post: idea)

      expect(service.moderators_for(comment).ids).to match_array [admin.id, moderator.id, also_moderator.id]
    end

    it "lists all moderators of an initiative" do
      project = create(:project)
      mortal = create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [project])
      initiative = create(:initiative)

      expect(service.moderators_for(initiative).ids).to match_array [admin.id]
    end
  end
end
