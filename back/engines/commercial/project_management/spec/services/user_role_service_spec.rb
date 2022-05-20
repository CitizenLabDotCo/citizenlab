# frozen_string_literal: true

require 'rails_helper'

describe UserRoleService do
  let(:service) { described_class.new }

  describe 'can_moderate_project?' do
    let(:project) { create :project }

    it 'permits project moderators' do
      expect(service.can_moderate_project?(project, create(:project_moderator, projects: [project]))).to be_truthy
    end

    it 'denies other project moderators' do
      expect(service.can_moderate_project?(project, create(:project_moderator, projects: [create(:project)]))).to be false
    end
  end

  describe 'moderators_for' do
    it 'lists all moderators of a project' do
      project = create :project
      other_project = create :project
      create :user
      admin = create :admin
      moderator = create :project_moderator, projects: [project, other_project]
      create :project_moderator, projects: [other_project]

      expect(service.moderators_for(project).ids).to match_array [admin.id, moderator.id]
    end

    it 'lists all moderators of an idea' do
      project = create :project
      other_project = create :project
      create :user
      admin = create :admin
      moderator = create :project_moderator, projects: [other_project, project]
      also_moderator = create :project_moderator, projects: [project]
      create :project_moderator, projects: [other_project]
      idea = create :idea, project: project

      expect(service.moderators_for(idea).ids).to match_array [admin.id, moderator.id, also_moderator.id]
    end

    it 'lists all moderators of a comment' do
      project = create :project
      other_project = create :project
      create :user
      admin = create :admin
      moderator = create :project_moderator, projects: [other_project, project]
      also_moderator = create :project_moderator, projects: [project]
      create :project_moderator, projects: [other_project]
      idea = create :idea, project: project
      comment = create :comment, post: idea

      expect(service.moderators_for(comment).ids).to match_array [admin.id, moderator.id, also_moderator.id]
    end

    it 'lists all moderators of an initiative' do
      project = create :project
      create :user
      admin = create :admin
      create :project_moderator, projects: [project]
      initiative = create :initiative

      expect(service.moderators_for(initiative).ids).to match_array [admin.id]
    end
  end

  describe 'moderators_for_project' do
    it 'lists only project moderators and admins' do
      project = create :project
      other_project = create :project
      create :user
      admin = create :admin
      moderator = create :project_moderator, projects: [other_project, project]
      also_moderator = create :project_moderator, projects: [project]
      create :project_moderator, projects: [other_project]

      expect(service.moderators_for_project(project).ids).to match_array [admin.id, moderator.id, also_moderator.id]
    end
  end

  describe 'moderatable_projects' do
    it 'lists some projects for project moderators' do
      projects = create_list :project, 3
      other_project = create :project

      moderator = create :project_moderator, projects: projects
      create :project_moderator, projects: [other_project, projects.first]

      expect(service.moderatable_projects(moderator).ids).to match_array projects.map(&:id)
    end
  end

  describe 'moderates_something?' do
    it 'permits project moderators' do
      expect(service.moderates_something?(create(:project_moderator))).to be_truthy
    end
  end
end
