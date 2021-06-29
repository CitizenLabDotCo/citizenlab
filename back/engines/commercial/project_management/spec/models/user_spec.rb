# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe '#roles' do
    it 'is valid when the user is a project moderator' do
      project = create(:project)
      u = build(:user, roles: [{ type: 'project_moderator', project_id: project.id }])
      expect(u).to be_valid
    end

    it 'is invalid when a project_moderator is missing a project_id' do
      u = build(:user, roles: [{ type: 'project_moderator' }])
      expect { u.valid? }.to(change { u.errors[:roles] })
    end
  end

  describe '#project_moderator?' do
    it 'responds true when the user has the project_moderator role' do
      l = create(:project)
      u = build(:user, roles: [{ type: 'project_moderator', project_id: l.id }])
      expect(u.project_moderator?(l.id)).to eq true
    end

    it 'responds false when the user does not have a project_moderator role for the given project' do
      l1 = create(:project)
      l2 = create(:project)
      u = build(:user, roles: [{ type: 'project_moderator', project_id: l1.id }])
      expect(u.project_moderator?(l2.id)).to eq false
    end

    it 'responds true when the user is project_moderator and no project_id is passed' do
      u = build(:user, roles: [{ type: 'project_moderator', project_id: 'project_id' }])
      expect(u.project_moderator?).to eq true
    end
  end

  describe "add_role" do
    it "gives a user moderator rights for a project" do
      usr = create(:user, roles: [])
      prj = create(:project)
      expect(usr.project_moderator? prj.id).to eq false

      usr.add_role 'project_moderator', project_id: prj.id
      expect(usr.save).to eq true
      expect(usr.project_moderator? prj.id).to eq true
      expect(usr.project_moderator? create(:project).id).to eq false
    end
  end

  describe "delete_role" do
    it "denies a user from his moderator rights" do
      prj = create(:project)
      mod = create(:project_moderator, projects: [prj])

      mod.delete_role 'project_moderator', project_id: prj.id
      expect(mod.save).to eq true
      expect(mod.project_moderator? prj.id).to eq false
    end

    it "demotes the user from default_assignee of the moderated project" do
      prj = create(:project)
      mod = create(:project_moderator, projects: [prj])
      prj.default_assignee = mod
      prj.save

      mod.delete_role 'project_moderator', project_id: prj.id
      expect(mod.save).to eq true
      expect(prj.reload.default_assignee_id).not_to eq mod.id
    end

    it "demotes the user from assignee of the moderated project's ideas" do
      prj = create(:project)
      mod = create(:project_moderator, projects: [prj])
      prj.default_assignee = mod
      prj.save

      ideas = create_list(:idea, 3, project: prj, assignee: mod)

      mod.delete_role 'project_moderator', project_id: prj.id
      expect(mod.save).to eq true
      ideas = Idea.where(id: ideas.pluck(:id)) # this is necessary to reload the objects
      expect(ideas.pluck(:assignee_id)).not_to include mod.id
    end
  end

  describe "highest_role" do
    it "correctly returns the highest role the user posesses" do
      expect(build_stubbed(:project_moderator).highest_role).to eq :project_moderator
    end
  end
end
