# frozen_string_literal: true

require 'rails_helper'

describe SideFxIdeaService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'before create' do
    let(:default_assignee) { create(:admin) }
    let(:project) { create(:project, default_assignee: default_assignee) }

    it 'does not set the assignee of a draft idea to the default_assignee of the project' do
      idea = build(:idea, project: project, publication_status: 'draft')
      service.before_create(idea, user)
      expect(idea.assignee).to be_nil
    end

    it 'sets the assignee of a submitted idea to the default_assignee of the project' do
      idea = build(:idea, project: project, publication_status: 'submitted')
      service.before_create(idea, user)
      expect(idea.assignee).to eq default_assignee
    end

    it 'sets the assignee of a published idea to the default_assignee of the project' do
      idea = build(:idea, project: project, publication_status: 'published')
      service.before_create(idea, user)
      expect(idea.assignee).to eq default_assignee
    end

    it "doesn't change the assignee if it's already set" do
      assignee = build(:admin)
      idea = build(:idea, project: project, assignee: assignee)
      service.before_create(idea, user)
      expect(idea.assignee).to eq assignee
    end
  end

  describe 'before_update' do
    let(:original_project) { create(:project) }
    let(:idea) { create(:idea, project: original_project, assignee: assignee) }

    context "when there's an assignee and the project has changed" do
      let(:assignee) { create(:project_moderator, projects: [original_project]) }

      it "unassigns the assignee if she can't moderate the new project" do
        idea.project = create(:project)
        expect { service.before_update(idea, nil) }.to change(idea, :assignee).from(assignee).to(nil)
      end

      it "doesn't change the assignee if she can moderate the new project" do
        new_project = create(:project)
        assignee.add_role('project_moderator', project_id: new_project.id)
        assignee.save
        idea.project = new_project
        expect { service.before_update(idea, nil) }.not_to change(idea, :assignee)
      end
    end

    context "when there's an (invalid) assignee and the project doesn't change" do
      let(:assignee) { nil }

      it "doesn't unassign" do
        idea.assignee = create(:user)
        expect { service.before_update(idea, nil) }.not_to change(idea, :assignee)
      end
    end

    context 'when no assignee was set before update' do
      let(:default_assignee) { create(:admin) }
      let(:project) { create(:project, default_assignee: default_assignee) }

      it 'does not set the assignee of a draft idea to the default_assignee of the project' do
        idea = build(:idea, project: project, publication_status: 'draft')
        service.before_update(idea, user)
        expect(idea.assignee).to be_nil
      end

      it 'sets the assignee of a submitted idea to the default_assignee of the project' do
        idea = build(:idea, project: project, publication_status: 'submitted')
        service.before_update(idea, user)
        expect(idea.assignee).to eq default_assignee
      end

      it 'sets the assignee of a published idea to the default_assignee of the project' do
        idea = build(:idea, project: project, publication_status: 'published')
        service.before_update(idea, user)
        expect(idea.assignee).to eq default_assignee
      end

      it "doesn't change the assignee if it's already set" do
        assignee = build(:admin)
        idea = build(:idea, project: project, assignee: assignee)
        service.before_create(idea, user)
        expect(idea.assignee).to eq assignee
      end
    end
  end

  describe 'after_update' do
    it "logs a 'changed_assignee' action job when the assignee has changed" do
      idea = create(:idea, assignee: create(:admin))
      old_assignee = idea.assignee
      new_assignee = create(:admin)
      idea.assignee = new_assignee
      service.before_update(idea, user)
      idea.save!

      expect { service.after_update(idea, user) }
        .to enqueue_job(LogActivityJob).with(
          idea,
          'changed_assignee',
          user,
          idea.updated_at.to_i,
          payload: { change: [old_assignee.id, new_assignee.id] },
          project_id: idea.project_id
        ).exactly(1).times
    end
  end
end
