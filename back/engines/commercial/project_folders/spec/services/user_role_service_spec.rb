# frozen_string_literal: true

require 'rails_helper'

describe UserRoleService do
  let(:service) { described_class.new }

  describe 'can_moderate?' do
    it 'for a project folder' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])

      expect(service).to be_can_moderate(folder, create(:project_folder_moderator, project_folders: [folder]))
      expect(service).to be_can_moderate(folder, create(:admin))
      expect(service).not_to be_can_moderate(folder, create(:user))
      expect(service).not_to be_can_moderate(folder, create(:project_folder_moderator))
      expect(service).not_to be_can_moderate(folder, create(:project_moderator, projects: [project]))
    end
  end

  describe 'can_moderate_project?' do
    let(:project) { create(:project) }
    let(:folder) { create(:project_folder, projects: [create(:project), project]) }

    it 'permits folder moderators' do
      expect(service).to be_can_moderate_project(project.reload, create(:project_folder_moderator, project_folders: [folder]))
    end

    it 'denies other folder moderators' do
      expect(service).not_to be_can_moderate_project(project.reload, create(:project_folder_moderator, project_folders: [create(:project_folder)]))
    end
  end

  describe 'moderators_for' do
    it 'lists all moderators of a project' do
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

    it 'lists all moderators of a project folder' do
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

  describe 'moderators_for_project' do
    it 'lists only project and folder moderators and admins' do
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

  describe 'moderatable_projects' do
    it 'lists some projects for project folder moderators' do
      projects = create_list(:project, 3)
      folder1 = create(:project_folder, projects: projects.take(2))
      folder2 = create(:project_folder, projects: [projects.last])
      other_project = create(:project)
      other_folder = create(:project_folder, projects: [other_project])

      moderator = create(:project_folder_moderator, project_folders: [folder2, folder1])
      other_moderator = create(:project_folder_moderator, project_folders: [other_folder])

      expect(service.moderatable_projects(moderator)).to match_array(projects)
      expect(service.moderatable_projects(other_moderator)).to match_array(other_project)
    end

    context 'when the user is both project moderator and admin' do
      let(:projects) { create_list(:project, 2) }
      let(:folder) { create(:project_folder, projects: projects.take(1)) }
      let(:user) { create(:project_folder_moderator, project_folders: [folder]).add_role('admin') }

      it 'lists all projects' do
        expect(service.moderatable_projects(user)).to match_array(projects)
      end
    end
  end
end
