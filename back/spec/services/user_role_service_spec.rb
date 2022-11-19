# frozen_string_literal: true

require 'rails_helper'

describe UserRoleService do
  let(:service) { described_class.new }

  describe 'can_moderate?' do
    it 'for a project' do
      project = create :project

      expect(service.can_moderate?(project, create(:admin))).to be true
      expect(service.can_moderate?(project, create(:user))).to be false
    end

    it 'for an idea' do
      project = create :project
      idea = create :idea, project: project

      expect(service.can_moderate?(idea, create(:admin))).to be true
      expect(service.can_moderate?(idea, create(:user))).to be false
    end

    it 'for an initiative' do
      initiative = create :initiative

      expect(service.can_moderate?(initiative, create(:admin))).to be true
      expect(service.can_moderate?(initiative, create(:user))).to be false
    end

    it 'for a comment' do
      initiative = create :initiative
      comment = create :comment, post: initiative

      expect(service.can_moderate?(comment, create(:admin))).to be true
      expect(service.can_moderate?(comment, create(:user))).to be false
    end
  end

  describe 'can_moderate_project?' do
    let(:project) { create :project }

    it 'permits admins' do
      expect(service.can_moderate_project?(project, create(:admin))).to be true
    end

    it 'denies normal users' do
      expect(service.can_moderate_project?(project, create(:user))).to be false
    end
  end

  describe 'moderators_for' do
    it 'lists all moderators of a project' do
      project = create :project
      create :project
      create :user
      admin = create :admin

      expect(service.moderators_for(project).ids).to match_array [admin.id]
    end

    it 'lists all moderators of an idea' do
      project = create(:project)
      create(:project)
      create(:user)
      admin = create(:admin)
      idea = create(:idea, project: project)

      expect(service.moderators_for(idea).ids).to match_array [admin.id]
    end

    it 'lists all moderators of a comment' do
      project = create :project
      create :project
      create :user
      admin = create :admin
      idea = create :idea, project: project
      comment = create :comment, post: idea

      expect(service.moderators_for(comment).ids).to match_array [admin.id]
    end

    it 'lists all moderators of an initiative' do
      create :project
      create :user
      admin = create :admin
      initiative = create :initiative

      expect(service.moderators_for(initiative).ids).to match_array [admin.id]
    end
  end

  describe 'moderators_for_project' do
    it 'lists only project moderators and admins' do
      project = create :project
      create :project
      create :user
      admin = create :admin
      also_admin = create :admin

      expect(service.moderators_for_project(project).ids).to match_array [admin.id, also_admin.id]
    end
  end

  describe 'moderatable_projects' do
    it 'lists no projects for normal users' do
      create_list :project, 2

      expect(service.moderatable_projects(create(:user)).ids).to eq []
    end

    it 'lists all projects for admins' do
      map_projects = create_list :project, 3, presentation_mode: 'map'
      create :project, presentation_mode: 'card'

      expect(
        service.moderatable_projects(create(:admin), Project.where(presentation_mode: 'map')).ids
      ).to match_array map_projects.map(&:id)
    end
  end

  describe 'moderates_something?' do
    it 'permits admins' do
      expect(service.moderates_something?(create(:admin))).to be true
    end

    it 'denies normal users' do
      expect(service.moderates_something?(create(:user))).to be false
    end
  end
end
