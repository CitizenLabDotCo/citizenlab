require "rails_helper"

describe UserRoleService do
  let(:service) { UserRoleService.new }

  describe "moderators_for_project" do
    it "lists only project and folder moderators and admins" do
      project = create(:project)
      other_project = create(:project)
      folder = create(:project_folder, projects: [project])
      other_folder = create(:project_folder, projects: [other_project])
      mortal = create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [other_project, project])
      also_moderator = create(:project_moderator, projects: [project])
      other_moderator = create(:project_moderator, projects: [other_project])
      folder_moderator = create(:project_folder_moderator, project_folders: [folder])
      other_folder_moderator = create(:project_folder_moderator, project_folders: [other_folder])

      expect(service.moderators_for_project(project.reload).ids).to match_array [admin.id, moderator.id, also_moderator.id, folder_moderator.id]
    end
  end

  describe "moderators_for" do
    it "lists all moderators of a project" do
      project = create(:project)
      other_project = create(:project)
      folder = create(:project_folder, projects: [project])
      other_folder = create(:project_folder, projects: [other_project])
      mortal = create(:user)
      admin = create(:admin)
      folder_moderator = create(:project_folder_moderator, project_folders: [other_folder, folder])
      other_folder_moderator = create(:project_folder_moderator, project_folders: [other_folder])

      expect(service.moderators_for(project.reload).ids).to match_array [admin.id, folder_moderator.id]
    end

    it "lists all moderators of a project folder" do
      project = create(:project)
      folder = create(:project_folder, projects: [project])
      other_folder = create(:project_folder)
      mortal = create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [project])
      folder_moderator = create(:project_folder_moderator, project_folders: [other_folder, folder])
      other_folder_moderator = create(:project_folder_moderator, project_folders: [other_folder])

      expect(service.moderators_for(folder).ids).to match_array [admin.id, folder_moderator.id]
    end
  end
end
