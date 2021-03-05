require 'rails_helper'

describe SideFxIdeaService do
  let(:service) { SideFxIdeaService.new }
  let(:user) { create(:user) }

  describe 'before create' do
    it 'assigns the idea to the current phase' do
      project = create(:project_with_active_ideation_phase)
      idea = build(:idea, project: project)
      expect(idea.phases).to be_empty
      service.before_create(idea, user)
      expect(idea.phases).to eq [project.phases.first]
    end

    it "doesn't touch the idea phases when they're already assigned" do
      project = create(:project_with_phases)
      idea = build(:idea, project: project, phases: [project.phases.last])
      service.before_create(idea, user)
      expect(idea.phases).to eq [project.phases.last]
    end

    it 'assigns the idea to the first ideation phase for a project with future phases' do
      project = create(:project_with_future_phases)
      idea = build(:idea, project: project)
      expect(idea.phases).to be_empty
      service.before_create(idea, user)
      expect(idea.phases).to eq [project.phases.first]
    end

    it 'sets the assignee to the default_assignee of the project' do
      default_assignee = create(:admin)
      project = create(:project, default_assignee: default_assignee)
      idea = build(:idea, project: project)
      service.before_create(idea, user)
      expect(idea.assignee).to eq default_assignee
    end

    it "doesn't change the assignee if it's already set" do
      default_assignee = create(:admin)
      assignee = build(:admin)
      project = create(:project, default_assignee: default_assignee)
      idea = build(:idea, project: project, assignee: assignee)
      service.before_create(idea, user)
      expect(idea.assignee).to eq assignee
    end
  end

  describe 'after_create' do
    it "logs a 'published' action job when publication_state is published" do
      idea = create(:idea, publication_status: 'published', author: user)
      expect {service.after_create(idea, user)}.
        to have_enqueued_job(LogActivityJob).with(idea, 'published', user, idea.created_at.to_i).exactly(1).times
        .and have_enqueued_job(LogActivityJob).with(idea, 'first_published_by_user', user, idea.created_at.to_i).exactly(1).times
        .and have_enqueued_job(Seo::ScrapeFacebookJob).exactly(1).times
    end

    it "doesn't log a 'published' action job when publication_state is draft" do
      idea = create(:idea, publication_status: 'draft')
      expect { service.after_create(idea, user) }
        .not_to have_enqueued_job(LogActivityJob)
    end

    it "doesn't logs a 'first published by user' action job when ideas are created after the first one" do
      idea1 = create(:idea, publication_status: 'published', author: user)
      idea2 = create(:idea, publication_status: 'published', author: user)
      expect { service.after_create(idea2, user) }
        .not_to have_enqueued_job(LogActivityJob).with(idea2, 'first_published_by_user', user, idea2.created_at.to_i)
    end
  end

  describe 'before_update' do
    let(:original_project) { create(:project) }
    let(:idea) { create(:idea, project: original_project, assignee: assignee) }

    context "when there's an assignee and the project has changed" do
      let(:assignee) { create(:moderator, project: original_project) }

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

    it 'sets the assignee to the default_assignee of the project on publish' do
      default_assignee = create(:admin)
      project = create(:project, default_assignee: default_assignee)
      idea = create(:idea, project: project, publication_status: 'draft')
      idea.publication_status = 'published'
      expect { service.before_update(idea, user) }.to change { idea.assignee }.from(nil).to(default_assignee)
    end

    it "doesn't set the assignee if it's already set before publish" do
      default_assignee = create(:admin)
      project = create(:project, default_assignee: default_assignee)
      idea = create(:idea, project: project, publication_status: 'draft', assignee: create(:admin))
      idea.publication_status = 'published'
      expect { service.before_update(idea, user) }.not_to change { idea.assignee }
    end
  end

  describe 'after_update' do
    it "logs a 'published' action job when publication_state goes from draft to published, as well as a first idea published log when the idea was first published" do
      idea = create(:idea, publication_status: 'draft', author: user)
      idea.update(publication_status: 'published')
      expect { service.after_update(idea, user) }.to(
        have_enqueued_job(LogActivityJob).with(idea, 'published', user, idea.created_at.to_i).exactly(1).times
      .and(
        have_enqueued_job(LogActivityJob).with(idea, 'first_published_by_user', user,
                                               idea.created_at.to_i).exactly(1).times
      )
      )
    end

    it "logs a 'changed' action job when the idea has changed" do
      idea = create(:idea)
      old_idea_title = idea.title_multiloc
      idea.update(title_multiloc: {'en': 'something else'})
      expect {service.after_update(idea, user)}.
        to have_enqueued_job(LogActivityJob).with(idea, 'changed', any_args).exactly(1).times
        .and have_enqueued_job(Seo::ScrapeFacebookJob).exactly(1).times
    end

    it "logs a 'changed_title' action job when the title has changed" do
      idea = create(:idea)
      old_idea_title = idea.title_multiloc
      idea.update(title_multiloc: { 'en': 'changed' })
      expect { service.after_update(idea, user) }
        .to have_enqueued_job(LogActivityJob).with(idea, 'changed_title', any_args,
                                                   payload: { change: [old_idea_title, idea.title_multiloc] }).exactly(1).times
    end

    it "logs a 'changed_body' action job when the body has changed" do
      idea = create(:idea)
      old_idea_body = idea.body_multiloc
      idea.update(body_multiloc: { 'en': 'changed' })
      expect { service.after_update(idea, user) }
        .to have_enqueued_job(LogActivityJob).with(idea, 'changed_body', any_args,
                                                   payload: { change: [old_idea_body, idea.body_multiloc] })
    end

    it "logs a 'changed_status' action job when the idea_status has changed" do
      idea = create(:idea)
      old_idea_status = idea.idea_status
      new_idea_status = create(:idea_status)
      idea.update(idea_status: new_idea_status)
      expect { service.after_update(idea, user) }
        .to have_enqueued_job(LogActivityJob).with(idea, 'changed_status', user, idea.updated_at.to_i,
                                                   payload: { change: [old_idea_status.id, new_idea_status.id] }).exactly(1).times
    end

    it "logs a 'changed_assignee' action job when the assignee has changed" do
      idea = create(:idea, assignee: create(:admin))
      old_assignee = idea.assignee
      new_assignee = create(:admin)
      idea.assignee = new_assignee
      service.before_update(idea, user)
      idea.save!
      expect { service.after_update(idea, user) }
        .to have_enqueued_job(LogActivityJob).with(idea, 'changed_assignee', user, idea.updated_at.to_i,
                                                   payload: { change: [old_assignee.id, new_assignee.id] }).exactly(1).times
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the idea is destroyed" do
      idea = create(:idea)
      travel_to Time.now do
        frozen_idea = idea.destroy
        expect { service.after_destroy(frozen_idea, user) }
          .to have_enqueued_job(LogActivityJob).exactly(1).times
      end
    end
  end
end
